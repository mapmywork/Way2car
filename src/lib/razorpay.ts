import Razorpay from "razorpay";

// ─── Razorpay Client ─────────────────────────────────────────────

function createRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn(
      "[Razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Payments disabled."
    );
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const razorpay = createRazorpayClient();

// ─── Payment Helpers ─────────────────────────────────────────────

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * Prevents tampering with payment data.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  // Use Node.js crypto for HMAC verification
  const crypto = require("crypto");
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  return expectedSignature === params.signature;
}

/**
 * Check if Razorpay is in test mode.
 * Test keys start with "rzp_test_", live keys start with "rzp_live_".
 */
export function isTestMode(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  return keyId?.startsWith("rzp_test_") ?? true;
}
