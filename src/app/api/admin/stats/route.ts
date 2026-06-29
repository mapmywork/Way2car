import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";
import { handleApiError } from "@/lib/api-middlewares";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return apiError("Unauthorized", "FORBIDDEN", 403);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBookings,
      activeVehicles,
      newCustomers,
      revenueResult
    ] = await Promise.all([
      db.booking.count(),
      db.vehicle.count({ where: { isActive: true } }),
      db.user.count({ 
        where: { 
          role: "CUSTOMER",
          createdAt: { gte: startOfMonth }
        } 
      }),
      db.payment.aggregate({
        where: { status: "SUCCEEDED" },
        _sum: { amount: true }
      })
    ]);

    return apiSuccess({
      stats: {
        totalBookings,
        activeVehicles,
        newCustomersThisMonth: newCustomers,
        totalRevenue: revenueResult._sum.amount || 0, // in paise
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
