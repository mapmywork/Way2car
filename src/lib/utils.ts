// ─── Utility Functions — Way2Car ─────────────────────────────────

/**
 * Generate a human-readable confirmation code: W2C-XXXXX
 * Uses only unambiguous characters (no 0/O, 1/l/I).
 */
export function generateConfirmationCode(): string {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "W2C-";
  for (let i = 0; i < 5; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Calculate the number of rental days between two dates.
 * Minimum 1 day.
 */
export function calculateRentalDays(pickupDate: Date, dropoffDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil(
    (dropoffDate.getTime() - pickupDate.getTime()) / msPerDay
  );
  return Math.max(1, diff);
}

/**
 * Calculate total booking price in paise.
 * @param pricePerDay - Price per day in paise
 * @param days - Number of rental days
 * @param taxRate - Tax rate as decimal (e.g., 0.18 for 18% GST)
 * @returns { totalPrice, taxAmount, basePrice } all in paise
 */
export function calculateBookingPrice(
  pricePerDay: number,
  days: number,
  taxRate: number = 0.18
): { basePrice: number; taxAmount: number; totalPrice: number } {
  const basePrice = pricePerDay * days;
  const taxAmount = Math.round(basePrice * taxRate);
  const totalPrice = basePrice + taxAmount;
  return { basePrice, taxAmount, totalPrice };
}

/**
 * Format paise amount to INR display string.
 * e.g., 150000 → "₹1,500.00"
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format a Date to a human-readable string.
 * e.g., "26 Jun 2026"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format a Date to ISO date string (YYYY-MM-DD).
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get an array of dates between start and end (inclusive).
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Standard API error response format.
 */
export function apiError(
  message: string,
  code: string = "BAD_REQUEST",
  status: number = 400,
  details?: unknown
): Response {
  return Response.json(
    { error: message, code, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Standard API success response format.
 */
export function apiSuccess<T>(data: T, status: number = 200): Response {
  return Response.json(data, { status });
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Validate that all required environment variables are set.
 * Call at app startup.
 */
export function validateEnv(requiredVars: string[]): void {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
