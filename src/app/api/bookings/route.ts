import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createBookingSchema } from "@/lib/validators";
import { apiSuccess, apiError, generateConfirmationCode, calculateRentalDays, calculateBookingPrice, getDateRange } from "@/lib/utils";
import { handleApiError, rateLimit, RATE_LIMITS } from "@/lib/api-middlewares";
import { requireAuth, isAdmin, getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const isUserAdmin = user.role === "ADMIN";
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");

    const where: any = {};
    if (!isUserAdmin) {
      where.userId = user.id;
    }
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          vehicle: { select: { make: true, model: true, year: true, images: true } },
          pickupLocation: { select: { name: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.booking.count({ where }),
    ]);

    return apiSuccess({
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { success } = await rateLimit(req, `bookings_post_${user.id}`, RATE_LIMITS.BOOKING.limit, RATE_LIMITS.BOOKING.window);
    if (!success) return apiError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429);

    const body = await req.json();
    const result = createBookingSchema.safeParse(body);
    
    if (!result.success) {
      return apiError("Invalid booking data", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const { vehicleId, pickupLocationId, dropoffLocationId, pickupDate, dropoffDate } = result.data;
    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);

    // Get vehicle to check price and active status
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle || !vehicle.isActive) {
      return apiError("Vehicle is not available", "NOT_FOUND", 404);
    }

    const days = calculateRentalDays(start, end);
    const { taxAmount, totalPrice } = calculateBookingPrice(vehicle.pricePerDay, days);
    const datesToBook = getDateRange(start, end);

    // Prisma Transaction: Double-check availability and create booking
    const booking = await db.$transaction(async (tx: any) => {
      // 1. Check if any dates are already marked unavailable (Row locking implicitly handled if we try to update/create availability)
      const existingUnavailable = await tx.availability.findMany({
        where: {
          vehicleId,
          date: { in: datesToBook },
          isAvailable: false,
        },
      });

      if (existingUnavailable.length > 0) {
        throw new Error("VEHICLE_UNAVAILABLE");
      }

      // 2. Generate unique confirmation code
      let code = generateConfirmationCode();
      let isCodeUnique = false;
      while (!isCodeUnique) {
        const existing = await tx.booking.findUnique({ where: { confirmationCode: code } });
        if (!existing) isCodeUnique = true;
        else code = generateConfirmationCode();
      }

      // 3. Mark dates as unavailable
      const availabilityOperations = datesToBook.map((date) =>
        tx.availability.upsert({
          where: { vehicleId_date: { vehicleId, date } },
          update: { isAvailable: false },
          create: { vehicleId, date, isAvailable: false },
        })
      );
      await Promise.all(availabilityOperations);

      // 4. Create the booking record
      return await tx.booking.create({
        data: {
          confirmationCode: code,
          userId: user.id,
          vehicleId,
          pickupLocationId,
          dropoffLocationId,
          pickupDate: start,
          dropoffDate: end,
          totalPrice,
          taxAmount,
          status: "PENDING", // Becomes CONFIRMED after payment
        },
      });
    });

    return apiSuccess({ booking }, 201);
  } catch (error: any) {
    if (error.message === "VEHICLE_UNAVAILABLE") {
      return apiError("Vehicle is no longer available for these dates", "CONFLICT", 409);
    }
    return handleApiError(error);
  }
}
