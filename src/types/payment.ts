// ─── Payment Types ────────────────────────────────────────────────

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number; // stored in paise
  currency: string; // "INR"
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentOrderInput {
  bookingId: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
