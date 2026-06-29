import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { updateBookingStatusSchema } from "@/lib/validators";
import { apiSuccess, apiError, getDateRange } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";
import { requireAuth, isAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        pickupLocation: true,
        dropoffLocation: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
      },
    });

    if (!booking) {
      return apiError("Booking not found", "NOT_FOUND", 404);
    }

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return apiError("Unauthorized", "FORBIDDEN", 403);
    }

    return apiSuccess({ booking });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const isUserAdmin = await isAdmin();

    const body = await req.json();
    const result = updateBookingStatusSchema.safeParse(body);
    
    if (!result.success) {
      return apiError("Invalid update data", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const { status } = result.data;

    const existingBooking = await db.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return apiError("Booking not found", "NOT_FOUND", 404);
    }

    // Only admins can arbitrarily change status. Users can only CANCEL their own pending/confirmed bookings.
    if (!isUserAdmin) {
      if (existingBooking.userId !== user.id) {
         return apiError("Unauthorized", "FORBIDDEN", 403);
      }
      if (status !== "CANCELLED") {
         return apiError("Users can only cancel bookings", "FORBIDDEN", 403);
      }
      if (existingBooking.status === "ACTIVE" || existingBooking.status === "COMPLETED") {
         return apiError("Cannot cancel an active or completed booking", "BAD_REQUEST", 400);
      }
    }

    // If cancelled, free up the availability
    if (status === "CANCELLED" && existingBooking.status !== "CANCELLED") {
       const datesToFree = getDateRange(existingBooking.pickupDate, existingBooking.dropoffDate);
       
       await db.$transaction([
         db.booking.update({
           where: { id },
           data: { status },
         }),
         ...datesToFree.map((date) => 
            db.availability.updateMany({
              where: { vehicleId: existingBooking.vehicleId, date },
              data: { isAvailable: true },
            })
         )
       ]);

       // NOTE: We could also trigger a Razorpay refund here if a payment exists.
       // For Phase 2, we have a dedicated admin refund endpoint for that.
       return apiSuccess({ message: "Booking cancelled successfully" });
    }

    // Normal status update
    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status },
    });

    return apiSuccess({ booking: updatedBooking });
  } catch (error) {
    return handleApiError(error);
  }
}
