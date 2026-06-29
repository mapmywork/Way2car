import { Resend } from "resend";

// ─── Email Client (Resend) ───────────────────────────────────────

function createEmailClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set. Email notifications disabled.");
    return null;
  }

  return new Resend(apiKey);
}

export const emailClient = createEmailClient();

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Way2Car <bookings@way2car.com>";

// ─── Email Templates ─────────────────────────────────────────────

interface BookingEmailData {
  customerName: string;
  confirmationCode: string;
  vehicleName: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: string; // formatted (e.g., "₹4,500.00")
}

/**
 * Send booking confirmation email.
 * Non-blocking: booking succeeds even if email fails.
 */
export async function sendBookingConfirmation(
  to: string,
  data: BookingEmailData
): Promise<boolean> {
  if (!emailClient) {
    console.warn("[Email] Skipping booking confirmation — email client not configured.");
    return false;
  }

  try {
    await emailClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Confirmed — ${data.confirmationCode} | Way2Car`,
      html: buildConfirmationEmailHtml(data),
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send booking confirmation:", error);
    return false;
  }
}

/**
 * Send booking cancellation email.
 */
export async function sendBookingCancellation(
  to: string,
  data: Pick<BookingEmailData, "customerName" | "confirmationCode" | "vehicleName" | "totalPrice">
): Promise<boolean> {
  if (!emailClient) {
    console.warn("[Email] Skipping cancellation email — email client not configured.");
    return false;
  }

  try {
    await emailClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Cancelled — ${data.confirmationCode} | Way2Car`,
      html: buildCancellationEmailHtml(data),
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send cancellation email:", error);
    return false;
  }
}

// ─── HTML Templates ──────────────────────────────────────────────

function buildConfirmationEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;">Way2Car</h1>
        <p style="color:#93c5fd;margin:8px 0 0;font-size:14px;">Your Booking is Confirmed ✓</p>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px;color:#374151;">Hi ${data.customerName},</p>
        <p style="font-size:14px;color:#6b7280;">Your booking has been confirmed. Here are your details:</p>
        
        <!-- Confirmation Code -->
        <div style="background:#f0f9ff;border:2px dashed #2563eb;border-radius:8px;padding:16px;text-align:center;margin:24px 0;">
          <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Confirmation Code</p>
          <p style="margin:8px 0 0;font-size:32px;font-weight:bold;color:#1e3a5f;font-family:monospace;">${data.confirmationCode}</p>
        </div>

        <!-- Booking Details -->
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:#374151;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="color:#6b7280;padding:8px 0;">Vehicle</td>
            <td style="text-align:right;font-weight:600;padding:8px 0;">${data.vehicleName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="color:#6b7280;padding:8px 0;">Pickup</td>
            <td style="text-align:right;padding:8px 0;">${data.pickupDate}<br><small style="color:#6b7280;">${data.pickupLocation}</small></td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="color:#6b7280;padding:8px 0;">Dropoff</td>
            <td style="text-align:right;padding:8px 0;">${data.dropoffDate}<br><small style="color:#6b7280;">${data.dropoffLocation}</small></td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding:12px 0;font-weight:600;font-size:16px;">Total Paid</td>
            <td style="text-align:right;font-weight:700;font-size:18px;color:#059669;padding:12px 0;">${data.totalPrice}</td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} Way2Car. All rights reserved.<br>
          Need help? Contact us at support@way2car.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCancellationEmailHtml(
  data: Pick<BookingEmailData, "customerName" | "confirmationCode" | "vehicleName" | "totalPrice">
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:linear-gradient(135deg,#7f1d1d,#dc2626);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;">Way2Car</h1>
        <p style="color:#fca5a5;margin:8px 0 0;font-size:14px;">Booking Cancelled</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px;color:#374151;">Hi ${data.customerName},</p>
        <p style="font-size:14px;color:#6b7280;">
          Your booking <strong>${data.confirmationCode}</strong> for <strong>${data.vehicleName}</strong> has been cancelled.
        </p>
        <p style="font-size:14px;color:#6b7280;">
          A refund of <strong>${data.totalPrice}</strong> will be processed within 5–7 business days.
        </p>
        <p style="font-size:14px;color:#6b7280;margin-top:24px;">
          If you did not request this cancellation, please contact our support team immediately.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} Way2Car. All rights reserved.<br>
          Need help? Contact us at support@way2car.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
