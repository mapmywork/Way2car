# Edge Cases & Corner Scenarios — Way2Car Car Rental Booking Platform

> This document catalogs all edge cases, corner scenarios, and boundary conditions that must be handled across the Way2Car platform. Each scenario includes the expected behavior and recommended handling strategy.

---

## 1. Booking Edge Cases

### 1.1 Race Conditions & Concurrency

| Scenario | Expected Behavior |
|----------|-------------------|
| **Two users book the same vehicle for the same dates simultaneously** | Only one booking succeeds. Use Prisma `$transaction` with row-level locking on `Availability`. The second request receives a `409 Conflict` with "Vehicle is no longer available for these dates". |
| **User submits the booking form twice (double-click)** | Idempotency guard: disable the submit button after first click + server-side check for duplicate bookings (same user, vehicle, dates within 30 seconds). |
| **Payment succeeds but booking confirmation API call fails (network drop)** | Razorpay webhook acts as backup. Webhook handler creates/confirms the booking if not already done. Orphaned payments are reconciled via a daily cron job. |
| **Booking created but payment never initiated (user abandons)** | Bookings in `PENDING` status with no payment after 15 minutes are auto-cancelled via a scheduled cleanup job. Availability is released back. |

### 1.2 Date & Time Boundaries

| Scenario | Expected Behavior |
|----------|-------------------|
| **Pickup date is in the past** | Reject with validation error: "Pickup date must be in the future". Server-side check uses UTC to avoid timezone manipulation. |
| **Pickup date equals dropoff date (same-day rental)** | Allow if business rules permit. Minimum rental duration = 1 day. Charge full day rate. |
| **Dropoff date is before pickup date** | Reject with validation error: "Dropoff date must be after pickup date". |
| **Booking spans across months/years (e.g., Dec 30 → Jan 5)** | Availability check must query across month boundaries correctly. Pricing calculation handles cross-month spans. |
| **Booking for a date exactly at midnight boundary** | Normalize all dates to start-of-day (00:00:00 UTC). A booking for Jan 15 means the vehicle is unavailable the entire day of Jan 15. |
| **Extremely long booking (e.g., 365 days)** | Enforce maximum booking duration (e.g., 90 days). Return validation error if exceeded. |
| **Booking starts today (same-day pickup)** | Allow only if pickup time is at least 2 hours in the future. Otherwise reject with "Minimum 2 hours advance booking required". |

### 1.3 Pricing Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| **Price changed between search and booking** | Re-calculate pricing at booking time using current DB rates. Show updated total in the review step. If price increased, notify user before confirming. |
| **Vehicle price is ₹0 or negative in DB** | Validate `pricePerDay > 0` at API level. Reject bookings for vehicles with invalid pricing. |
| **Tax calculation produces floating-point precision errors** | Use integer arithmetic (store prices in paise/cents). Convert to rupees only for display. E.g., ₹1,500.50 → stored as `150050`. |
| **Discount/coupon results in negative total** | Floor the total at ₹0. Free bookings still require payment step (₹0 order) for record-keeping. |
| **Currency mismatch with Razorpay** | Always create Razorpay orders in INR. Validate currency matches before verification. |

### 1.4 Confirmation Codes

| Scenario | Expected Behavior |
|----------|-------------------|
| **Generated confirmation code already exists in DB** | Retry generation (up to 5 attempts) with a new random code. If all retries fail, fall back to a UUID-based code. |
| **Confirmation code contains ambiguous characters (0/O, 1/l/I)** | Exclude ambiguous characters from the generation alphabet. Use only `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. |

---

## 2. Payment Edge Cases

### 2.1 Razorpay Integration

| Scenario | Expected Behavior |
|----------|-------------------|
| **Payment succeeds on Razorpay but signature verification fails** | Do NOT confirm booking. Log the event as suspicious. Return error to user. Investigate manually. Do not auto-refund (could be a replay attack). |
| **Razorpay checkout modal closed by user without completing** | Booking stays in `PENDING`. Show "Complete your payment" prompt if user returns. Auto-cancel after 15-minute timeout. |
| **Razorpay returns an error (gateway down, bank decline)** | Show user-friendly error: "Payment failed. Please try again or use a different payment method." Allow retry without creating a new booking. |
| **Duplicate webhook delivery from Razorpay** | Idempotency check: if `razorpay_payment_id` already exists in `Payment` table, skip processing. Return `200 OK` to acknowledge. |
| **Webhook arrives before client-side verification call** | Webhook handler should create/confirm the booking. When the client-side verify call arrives, it finds the booking already confirmed and returns success. |
| **Partial payment (amount mismatch)** | Compare `razorpay_order.amount` with `booking.totalPrice`. If mismatch, reject and log for investigation. |
| **Payment in test mode accidentally hits production** | Validate Razorpay key prefix (`rzp_test_` vs `rzp_live_`) matches the environment. Reject mismatched requests. |

### 2.2 Refunds

| Scenario | Expected Behavior |
|----------|-------------------|
| **Refund requested for a booking older than Razorpay's refund window** | Razorpay allows refunds within 6 months. For older bookings, show "Refund not available. Please contact support." |
| **Partial refund (e.g., cancellation fee deducted)** | Calculate refund amount based on cancellation policy (e.g., full refund if cancelled 48h+ before pickup, 50% if 24–48h, no refund within 24h). Send partial refund amount to Razorpay. |
| **Refund API call to Razorpay fails** | Retry up to 3 times with exponential backoff. If all retries fail, mark as `REFUND_PENDING` and alert admin. Queue for manual processing. |
| **Double refund attempt** | Check `Payment.status === 'REFUNDED'` before processing. Return "Refund already processed" if already refunded. |

---

## 3. Authentication Edge Cases

### 3.1 Registration

| Scenario | Expected Behavior |
|----------|-------------------|
| **Email already registered (credentials) → tries Google OAuth with same email** | Link accounts. If email matches existing credentials user, offer to link Google OAuth to the existing account. |
| **Google OAuth email → tries to register with same email via credentials** | Reject: "An account with this email already exists. Please sign in with Google." |
| **Registration with disposable/temporary email** | Optional: validate email domain against a disposable email blocklist. Or allow it — the email confirmation step will catch invalid emails. |
| **Extremely long name/email input** | Enforce max lengths: name ≤ 100 chars, email ≤ 255 chars. Truncate or reject. |
| **SQL injection or XSS in registration fields** | Prisma parameterizes queries (safe from SQL injection). Sanitize and escape all user inputs for XSS. Zod validates format. |
| **Password is empty or whitespace-only** | Zod validation: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number. Trim and reject whitespace-only. |
| **Phone number with country code, spaces, dashes** | Normalize phone numbers: strip all non-digit characters except leading `+`. Validate format with regex. Store in E.164 format. |

### 3.2 Sessions & Auth Flow

| Scenario | Expected Behavior |
|----------|-------------------|
| **JWT token expired mid-booking** | Detect 401 on API call → redirect to login page with `callbackUrl=/booking?...` to preserve booking state. After re-login, return to booking. |
| **User deleted from DB but JWT still valid** | Validate user existence in session callback. If user not found in DB, invalidate session and force re-login. |
| **Admin demoted to customer while logged in** | Next API call checks role from DB (not just JWT). Return 403 on admin routes. Update session on next refresh. |
| **Multiple browser tabs with different auth states** | Use `BroadcastChannel` API or `storage` event to sync auth state across tabs. Logout in one tab → logout in all tabs. |
| **CSRF attack on auth endpoints** | NextAuth.js includes CSRF protection by default. Verify CSRF tokens on all state-changing requests. |

---

## 4. Vehicle & Fleet Edge Cases

### 4.1 Vehicle Data

| Scenario | Expected Behavior |
|----------|-------------------|
| **Vehicle deactivated while a user is viewing its detail page** | Detail page shows "This vehicle is no longer available" message. "Book Now" button disabled. |
| **Vehicle deactivated while it has future confirmed bookings** | Do NOT cancel existing bookings. Vehicle remains visible in booking history. Mark as "unavailable for new bookings only." Alert admin about existing bookings. |
| **Vehicle with no images uploaded** | Show a branded placeholder image (Way2Car logo on a neutral background). Never show a broken image icon. |
| **Vehicle price updated while user has it in search results** | Search results are a snapshot. Price is re-validated at booking time. If price changed, show updated price in booking review. |
| **All vehicles at a location are booked for selected dates** | Search returns empty results for that location. Show: "No vehicles available at this location for your dates. Try different dates or another location." |
| **Vehicle has 0 availability records for requested dates** | Treat missing availability records as "available" (optimistic) OR "unavailable" (pessimistic). **Recommended: pessimistic** — if no availability record exists, the vehicle is not bookable. |

### 4.2 Vehicle Images

| Scenario | Expected Behavior |
|----------|-------------------|
| **Image upload to Cloudinary fails** | Show error toast: "Image upload failed. Please try again." Allow retry. Don't save the vehicle without at least one image (or use placeholder). |
| **Uploaded image is extremely large (50MB+)** | Enforce max file size on client (5MB) and server (10MB). Reject with: "Image must be under 5MB." |
| **Uploaded file is not an image (e.g., .exe renamed to .jpg)** | Validate MIME type on server: only `image/jpeg`, `image/png`, `image/webp` allowed. Reject others. |
| **Cloudinary CDN is down** | Images fail to load. Use `next/image` with `onError` handler → show placeholder. Don't break the page layout. |

---

## 5. Search Edge Cases

### 5.1 Query Params & Filters

| Scenario | Expected Behavior |
|----------|-------------------|
| **Search with no filters (empty query)** | Return all active vehicles, paginated. Default sort: featured/popular first. |
| **Search with invalid date format in URL** | Validate and reject: "Invalid date format. Please use the date picker." Don't crash — show search page with empty results. |
| **Price filter: minPrice > maxPrice** | Swap values silently (treat min as max and vice versa). Or return validation error. |
| **Price filter: negative values** | Clamp to 0. `minPrice = max(0, minPrice)`. |
| **Seats filter: 0 or negative** | Ignore invalid filter value. Return unfiltered results for that param. |
| **Page number exceeds total pages (e.g., page=999)** | Return empty results array with correct `totalPages` in metadata. Frontend shows "No more results." |
| **Extremely large page size (limit=10000)** | Enforce max limit (e.g., 50). Clamp: `limit = min(limit, 50)`. |
| **Search URL manually tampered with SQL/NoSQL injection** | Zod validates all query params. Prisma parameterizes queries. No raw SQL. |

### 5.2 Search UX

| Scenario | Expected Behavior |
|----------|-------------------|
| **User types very fast in search (rapid keystroke)** | Debounce API calls (300ms delay after last keystroke). Cancel previous in-flight request. |
| **Search returns 0 results** | Show friendly empty state: illustration + "No vehicles match your criteria" + suggestions (broaden dates, try different location, clear filters). |
| **Search API is slow (>3 seconds)** | Show skeleton loading immediately. After 5 seconds, show "Taking longer than expected…" message. After 15 seconds, show timeout error with retry button. |
| **User navigates away mid-search then returns via browser back** | URL-based state ensures search params are preserved. Re-fetch results on mount. |

---

## 6. Availability Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| **Availability cache (Redis) is stale — shows available but DB shows booked** | Always re-check DB at booking time (inside transaction). Cache is for display speed only, never trusted for booking decisions. |
| **Redis is completely down** | Fall back to direct DB queries. Performance degrades but functionality is preserved. Log Redis connection errors. |
| **Availability records missing for a date range** | Generate missing records on-the-fly during availability check (default to unavailable). Or return "Availability unknown — contact support." |
| **Timezone differences between server and client** | All dates stored and compared in UTC. Convert to user's local timezone only for display. API accepts and returns ISO 8601 dates. |
| **Daylight saving time transition during a booking** | Use UTC for all date calculations. DST does not affect day counts when using UTC date math. |
| **Leap year: Feb 29 booking** | Standard date libraries handle leap years. Ensure no custom date math breaks on Feb 29. Test explicitly. |
| **Vehicle availability updated by admin while user is mid-booking** | DB transaction at booking time catches this. If dates are no longer available, return 409: "Selected dates are no longer available." |

---

## 7. Admin Dashboard Edge Cases

### 7.1 Vehicle Management

| Scenario | Expected Behavior |
|----------|-------------------|
| **Admin deletes the only vehicle at a location** | Allow (soft delete). Location remains with 0 active vehicles. Search for that location returns empty results. |
| **Admin sets pricePerDay to 0** | Validate: `pricePerDay > 0`. Reject with: "Price must be greater than zero." |
| **Admin uploads duplicate vehicle (same make/model/year/location)** | Allow — could be two identical vehicles in the fleet. Differentiate by license plate or vehicle ID. |
| **Two admins edit the same vehicle simultaneously** | Last-write-wins. No optimistic locking in v1. Consider adding `updatedAt` comparison in future versions. |
| **Admin tries to deactivate a vehicle that is currently rented (ACTIVE booking)** | Allow deactivation but warn: "This vehicle has an active booking until [date]. It will be hidden from new bookings but the current booking remains valid." |

### 7.2 Booking Management

| Scenario | Expected Behavior |
|----------|-------------------|
| **Admin changes booking status from COMPLETED back to ACTIVE** | Prevent invalid state transitions. Allow only forward transitions: PENDING → CONFIRMED → ACTIVE → COMPLETED. CANCELLED is a terminal state from PENDING/CONFIRMED. |
| **Admin cancels a booking that has already been completed** | Reject: "Cannot cancel a completed booking." |
| **Admin issues refund but Razorpay amount doesn't match** | Refund the amount stored in Way2Car's `Payment` record, not a user-provided amount. Validate against Razorpay order. |
| **Dashboard stats query is slow on large datasets** | Use database aggregation queries, not application-level counting. Add indexes on `createdAt`, `status`. Consider materialized views for KPI data. |

### 7.3 Access Control

| Scenario | Expected Behavior |
|----------|-------------------|
| **Non-admin user manually navigates to `/admin`** | Middleware redirects to `/` with flash message: "You don't have permission to access this page." |
| **Admin's account is deleted while they're logged in** | Next API call fails auth check → redirect to login. Session invalidated. |
| **Only admin account is deleted** | Prevent deletion of the last admin account. Return: "Cannot delete the only admin account." |

---

## 8. Email Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| **Email service (Resend) is down** | Booking still succeeds. Email failure is non-blocking. Log the error. Queue for retry (up to 3 attempts, exponential backoff). Show user: "Booking confirmed! Confirmation email may be delayed." |
| **User's email address is invalid/bounces** | Resend reports bounce via webhook. Log it. Don't retry. User can still see booking details in their account. |
| **Email contains special characters in user name** | Sanitize user name in email templates. Escape HTML entities. Don't allow script injection via email content. |
| **Email template renders differently across email clients** | Use inline CSS only. Test with Litmus/Email on Acid. Use table-based layout for maximum compatibility. Avoid modern CSS (flexbox, grid). |

---

## 9. Performance & Infrastructure Edge Cases

### 9.1 Database

| Scenario | Expected Behavior |
|----------|-------------------|
| **Database connection pool exhausted** | Prisma's connection pool returns errors. Implement retry logic with backoff. Monitor pool usage. Increase pool size if consistently exhausted. |
| **Database migration fails in production** | Always test migrations on a staging DB first. Use `prisma migrate deploy` (not `dev`) in production. Have a rollback plan for each migration. |
| **Seed script run accidentally in production** | Guard seed script with environment check: `if (process.env.NODE_ENV === 'production') throw new Error('Cannot seed in production')`. |

### 9.2 API & Network

| Scenario | Expected Behavior |
|----------|-------------------|
| **API rate limit exceeded** | Return `429 Too Many Requests` with `Retry-After` header. Frontend shows: "Too many requests. Please wait a moment." |
| **Request body exceeds size limit** | Next.js default is 1MB. For image uploads, increase to 10MB on specific routes. Return `413 Payload Too Large` for others. |
| **Malformed JSON in request body** | Return `400 Bad Request` with: "Invalid request body." Don't expose parsing error details. |
| **Server returns 500 on a critical page** | Custom error page with: "Something went wrong. Please try again." Include a "Report Issue" link. Log full error with stack trace server-side. |
| **Vercel serverless function cold start** | First request may be slow (~1–2s). Use Edge Runtime for latency-sensitive routes (search, availability). Keep critical functions warm with periodic pings if needed. |

### 9.3 Frontend Resilience

| Scenario | Expected Behavior |
|----------|-------------------|
| **JavaScript fails to load (network error, ad blocker)** | Server-rendered pages still display content. Forms degrade gracefully. Show "Please enable JavaScript for the full experience." |
| **User has extremely slow connection (2G)** | Skeleton loaders visible until data loads. Images lazy-loaded. Critical CSS inlined. Page is usable before full JS loads. |
| **Browser doesn't support modern CSS (old Safari, IE)** | Use CSS feature queries (`@supports`). Provide reasonable fallbacks for glassmorphism (solid background), backdrop-filter (opacity), etc. |
| **User disables cookies** | NextAuth.js requires cookies for sessions. Detect and show: "Cookies are required for login. Please enable cookies in your browser settings." |
| **User zooms to 200%+** | All layouts must remain usable at 200% zoom. Use `rem`/`em` units. Test critical flows at 200%. |
| **Screen reader encounters dynamic content** | Use `aria-live` regions for search results, toast notifications, and status updates. Announce page transitions. |

---

## 10. Data Integrity & Validation

| Scenario | Expected Behavior |
|----------|-------------------|
| **UUID parameter is not a valid UUID** | Zod validates UUID format. Return `400 Bad Request`: "Invalid vehicle/booking ID format." |
| **Enum value not in allowed list (e.g., vehicleType=TRUCK)** | Zod validates against enum. Return `400`: "Invalid vehicle type. Allowed values: SEDAN, SUV, HATCHBACK, LUXURY, CONVERTIBLE, VAN." |
| **Decimal precision overflow (e.g., price = 123.456789)** | Round to 2 decimal places at API input. Store as integer (paise) internally. |
| **Empty string vs null for optional fields** | Normalize: treat empty strings as `null` for optional fields. Zod `.transform()` can handle this. |
| **Unicode/emoji in text fields (vehicle description, user name)** | Allow Unicode. PostgreSQL handles UTF-8 natively. Validate max byte length (not just character count). Render safely in HTML (escape). |
| **Very long text input (e.g., 100KB description)** | Enforce max length per field: description ≤ 2000 chars, name ≤ 100 chars, etc. Reject at Zod validation level. |

---

## 11. Business Logic Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| **User tries to book a vehicle they already have booked for overlapping dates** | Allow (business may have multiple vehicles of the same type) OR reject per business rules. Recommend: warn but allow. |
| **User cancels, then tries to rebook the same vehicle for the same dates** | Allow — cancellation releases availability. Dates become bookable again. |
| **Booking pickup and dropoff at different locations** | Support if locations are defined. Calculate any surcharge for one-way rentals. |
| **All locations are deactivated** | Search returns no results for any location. Home page featured fleet shows nothing. Show: "No locations currently available. Please check back later." |
| **Admin changes vehicle location while it has future bookings** | Warn admin: "This vehicle has future bookings at the current location. Changing location may cause confusion." Allow but log the change. Do NOT change the pickup location on existing bookings. |
| **User account with active booking tries to delete their account** | Prevent: "You have active bookings. Please complete or cancel them before deleting your account." |
| **Booking total exceeds Razorpay's max transaction limit** | Razorpay max is ₹50,00,000 (50 lakhs). For Way2Car, this is unlikely but validate: if total > ₹50,00,000, show error and suggest contacting support. |

---

## 12. Deployment & Environment Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| **Missing required environment variable** | Validate all required env vars at app startup (`next.config.js`). Throw descriptive error: "Missing required env var: DATABASE_URL". Fail fast. |
| **Wrong DATABASE_URL (typo in connection string)** | Prisma connection fails at startup. Log clear error message. Don't expose connection string in error response. |
| **NEXTAUTH_SECRET not set** | NextAuth.js throws error. App won't start. Error message: "NEXTAUTH_SECRET is required." |
| **Razorpay test keys used in production** | Detect key prefix mismatch. Log warning: "Razorpay test keys detected in production environment." Optionally block payments. |
| **Deployment succeeds but migration not run** | Prisma queries fail with "table does not exist." Include `prisma migrate deploy` in build/deploy script. Add health check endpoint that verifies DB connectivity. |
| **Environment variables changed but app not restarted (Vercel)** | Vercel requires redeployment for env var changes. Document this in deployment guide. |

---

## Summary: Priority Matrix

| Priority | Category | Count |
|----------|----------|-------|
| 🔴 **Critical** | Booking race conditions, payment verification, auth security, data integrity | ~20 |
| 🟡 **High** | Pricing edge cases, refund handling, availability cache, admin access control | ~15 |
| 🟢 **Medium** | Search UX, email failures, performance, browser compatibility | ~15 |
| 🔵 **Low** | UI edge cases (zoom, screen reader), deployment config, long text inputs | ~10 |

> **Total: ~60 edge cases** cataloged across 12 categories.
