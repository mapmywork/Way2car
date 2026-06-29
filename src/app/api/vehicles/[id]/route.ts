import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { updateVehicleSchema } from "@/lib/validators";
import { apiSuccess, apiError } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";
import { isAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (!vehicle) {
      return apiError("Vehicle not found", "NOT_FOUND", 404);
    }

    return apiSuccess({ vehicle });
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
    if (!(await isAdmin())) {
      return apiError("Unauthorized", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const result = updateVehicleSchema.safeParse(body);
    
    if (!result.success) {
      return apiError("Invalid update data", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: result.data,
      include: { location: true },
    });

    return apiSuccess({ vehicle });
  } catch (error) {
    // Check if it's a Prisma not found error (P2025)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
       return apiError("Vehicle not found", "NOT_FOUND", 404);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!(await isAdmin())) {
      return apiError("Unauthorized", "FORBIDDEN", 403);
    }

    // Soft delete
    await db.vehicle.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ message: "Vehicle deactivated successfully" });
  } catch (error) {
     if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
       return apiError("Vehicle not found", "NOT_FOUND", 404);
    }
    return handleApiError(error);
  }
}
