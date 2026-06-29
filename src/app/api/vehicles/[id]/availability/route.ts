import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { availabilityCheckSchema } from "@/lib/validators";
import { apiSuccess, apiError, getDateRange } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return apiError("startDate and endDate are required", "MISSING_PARAMS", 400);
    }

    const result = availabilityCheckSchema.safeParse({
      startDate: startDateParam,
      endDate: endDateParam,
    });

    if (!result.success) {
      return apiError("Invalid date format", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const { startDate, endDate } = result.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const vehicle = await db.vehicle.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!vehicle || !vehicle.isActive) {
      return apiError("Vehicle not found or inactive", "NOT_FOUND", 404);
    }

    // Find any unavailable records in the requested range
    const unavailableDates = await db.availability.findMany({
      where: {
        vehicleId: id,
        date: { gte: start, lte: end },
        isAvailable: false,
      },
      select: { date: true },
    });

    if (unavailableDates.length > 0) {
      return apiSuccess({
        available: false,
        unavailableDates: unavailableDates.map(d => d.date.toISOString().split("T")[0]),
      });
    }

    return apiSuccess({ available: true });
  } catch (error) {
    return handleApiError(error);
  }
}
