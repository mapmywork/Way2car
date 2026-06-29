import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { vehicleSearchSchema, createVehicleSchema } from "@/lib/validators";
import { apiSuccess, apiError } from "@/lib/utils";
import { handleApiError, rateLimit, RATE_LIMITS } from "@/lib/api-middlewares";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { success } = await rateLimit(req, "vehicles_get", RATE_LIMITS.PUBLIC_API.limit, RATE_LIMITS.PUBLIC_API.window);
    if (!success) return apiError("Too many requests", "RATE_LIMIT_EXCEEDED", 429);

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    // Parse numeric and optional boolean fields properly before validation
    const parsedQuery = {
      ...query,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      seats: query.seats ? Number(query.seats) : undefined,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    };

    const result = vehicleSearchSchema.safeParse(parsedQuery);
    if (!result.success) {
      return apiError("Invalid search parameters", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const filters = result.data;

    // Build Prisma Where Clause
    const where: any = { isActive: true };

    if (filters.location) {
      where.location = {
        OR: [
          { name: { contains: filters.location, mode: "insensitive" } },
          { city: { contains: filters.location, mode: "insensitive" } },
        ],
      };
    }

    if (filters.type) where.type = filters.type;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.seats) where.seats = { gte: filters.seats };
    
    if (filters.minPrice || filters.maxPrice) {
      where.pricePerDay = {};
      if (filters.minPrice) where.pricePerDay.gte = filters.minPrice;
      if (filters.maxPrice) where.pricePerDay.lte = filters.maxPrice;
    }

    // Availability Filter
    if (filters.pickupDate && filters.dropoffDate) {
      const start = new Date(filters.pickupDate);
      const end = new Date(filters.dropoffDate);
      
      // Find vehicles that DO NOT have an un-available record in the date range
      // (This requires a more complex query in Prisma, but for simplicity we check availability)
      where.availability = {
        none: {
          date: { gte: start, lte: end },
          isAvailable: false,
        },
      };
    }

    // Sorting logic
    let orderBy: any = { createdAt: "desc" };
    if (filters.sort === "price_asc") orderBy = { pricePerDay: "asc" };
    if (filters.sort === "price_desc") orderBy = { pricePerDay: "desc" };

    const skip = (filters.page - 1) * filters.limit;

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          location: {
            select: { id: true, name: true, city: true, state: true },
          },
        },
        orderBy,
        skip,
        take: filters.limit,
      }),
      db.vehicle.count({ where }),
    ]);

    return apiSuccess({
      data: vehicles,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return apiError("Unauthorized access", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const result = createVehicleSchema.safeParse(body);
    if (!result.success) {
      return apiError("Invalid vehicle data", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const vehicle = await db.vehicle.create({
      data: result.data,
      include: { location: true },
    });

    return apiSuccess({ vehicle }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
