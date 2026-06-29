import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validators";
import { apiSuccess, apiError, formatPrice, formatDate } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";
import { requireAuth } from "@/lib/auth";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const result = verifyPaymentSchema.safeParse(body);
    
    if (!result.success) {
      return apiError("Invalid verification data", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;

    // 1. Verify Signature
    const isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return apiError("Invalid payment signature", "FORBIDDEN", 403);
    }

    // 2. Find Pending Payment
    const payment = await db.payment.findFirst({
      where: { razorpayOrderId },
      include: {
        booking: {
          include: {
            vehicle: true,
            pickupLocation: true,
            dropoffLocation: true,
            user: true,
          }
        }
      }
    });

    if (!payment) {
      return apiError("Payment record not found", "NOT_FOUND", 404);
    }

    if (payment.status === "SUCCEEDED") {
       // Already verified (perhaps via webhook or accidental double-submit)
       return apiSuccess({ message: "Payment already verified", bookingId: payment.bookingId });
    }

    // 3. Update DB in Transaction
    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "SUCCEEDED",
        },
      }),
      db.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      })
    ]);

    // 4. Send Confirmation Email (Non-blocking)
    const b = payment.booking;
    sendBookingConfirmation(b.user.email, {
      customerName: b.user.name,
      confirmationCode: b.confirmationCode,
      vehicleName: `${b.vehicle.make} ${b.vehicle.model}`,
      pickupDate: formatDate(b.pickupDate),
      dropoffDate: formatDate(b.dropoffDate),
      pickupLocation: b.pickupLocation.name,
      dropoffLocation: b.dropoffLocation.name,
      totalPrice: formatPrice(b.totalPrice),
    });

    return apiSuccess({ message: "Payment verified successfully", bookingId: payment.bookingId });
  } catch (error) {
    return handleApiError(error);
  }
}
