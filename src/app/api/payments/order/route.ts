import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { createPaymentOrderSchema } from "@/lib/validators";
import { apiSuccess, apiError } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (!razorpay) {
      return apiError("Payments are currently disabled", "SERVICE_UNAVAILABLE", 503);
    }

    const body = await req.json();
    const result = createPaymentOrderSchema.safeParse(body);
    
    if (!result.success) {
      return apiError("Invalid payment data", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const { bookingId } = result.data;

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return apiError("Booking not found", "NOT_FOUND", 404);
    }

    if (booking.userId !== user.id) {
      return apiError("Unauthorized", "FORBIDDEN", 403);
    }

    if (booking.status !== "PENDING") {
      return apiError("Only pending bookings can be paid for", "BAD_REQUEST", 400);
    }

    // Create Razorpay Order
    const options = {
      amount: booking.totalPrice, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${booking.id}`,
      notes: {
        bookingId: booking.id,
        userId: user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create a Payment record in DB with PENDING status
    await db.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amount: booking.totalPrice,
        currency: "INR",
        status: "PENDING",
      },
    });

    return apiSuccess({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    return handleApiError(error);
  }
}
