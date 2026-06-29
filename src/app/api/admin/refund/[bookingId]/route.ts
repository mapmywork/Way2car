import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { apiSuccess, apiError } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";
import { isAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    if (!(await isAdmin())) {
      return apiError("Unauthorized", "FORBIDDEN", 403);
    }

    if (!razorpay) {
      return apiError("Payments are currently disabled", "SERVICE_UNAVAILABLE", 503);
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return apiError("Booking not found", "NOT_FOUND", 404);
    }

    if (booking.status !== "CANCELLED") {
      return apiError("Only cancelled bookings can be refunded", "BAD_REQUEST", 400);
    }

    const payment = booking.payment;

    if (!payment || !payment.razorpayPaymentId) {
      return apiError("No valid payment found to refund", "BAD_REQUEST", 400);
    }

    if (payment.status === "REFUNDED") {
       return apiSuccess({ message: "Payment is already refunded" });
    }

    // Trigger Razorpay Refund
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount, // Full refund
      speed: "optimum",
    });

    // We don't update DB status to REFUNDED immediately here unless we want to, 
    // it's usually better to let the webhook handle it.
    // But since this is a direct admin action, we can update it immediately for better UX.
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" }
    });

    return apiSuccess({ message: "Refund initiated successfully", refundId: refund.id });
  } catch (error) {
    return handleApiError(error);
  }
}
