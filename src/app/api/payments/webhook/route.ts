import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * Handle asynchronous Razorpay events
 * Useful for payments captured late, or refunds processed.
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET not set. Ignoring webhook.");
      return apiSuccess({ message: "Webhook ignored" });
    }

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return apiError("Missing signature", "UNAUTHORIZED", 401);
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return apiError("Invalid signature", "FORBIDDEN", 403);
    }

    const event = JSON.parse(body);

    // Handle events
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Check if we need to update our DB (if verify endpoint was missed)
      const payment = await db.payment.findFirst({
        where: { razorpayOrderId: orderId, status: "PENDING" },
      });

      if (payment) {
        await db.$transaction([
          db.payment.update({
            where: { id: payment.id },
            data: { razorpayPaymentId: paymentId, status: "SUCCEEDED" },
          }),
          db.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CONFIRMED" },
          })
        ]);
        console.log(`[Webhook] Payment captured and updated for order: ${orderId}`);
      }
    } 
    else if (event.event === "refund.processed") {
       const refundEntity = event.payload.refund.entity;
       const paymentId = refundEntity.payment_id;

       const payment = await db.payment.findUnique({
         where: { razorpayPaymentId: paymentId },
       });

       if (payment) {
         await db.payment.update({
           where: { id: payment.id },
           data: { status: "REFUNDED" }
         });
         console.log(`[Webhook] Refund processed for payment: ${paymentId}`);
       }
    }

    return apiSuccess({ status: "ok" });
  } catch (error) {
    console.error("[Webhook Error]", error);
    return apiError("Webhook processing failed", "INTERNAL_ERROR", 500);
  }
}
