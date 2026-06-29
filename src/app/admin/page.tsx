import { db } from "@/lib/db";
import styles from "@/styles/admin.module.css";
import KPICards from "@/components/admin/KPICards";
import RecentBookingsTable from "@/components/admin/RecentBookingsTable";
import Charts from "@/components/admin/Charts";

// Force dynamic rendering since we want live stats on load
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch KPI Stats
  const [
    totalBookings,
    activeVehicles,
    newCustomers,
    revenueResult,
    recentBookings
  ] = await Promise.all([
    db.booking.count(),
    db.vehicle.count({ where: { isActive: true } }),
    db.user.count({ 
      where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } 
    }),
    db.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true }
    }),
    db.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { make: true, model: true } },
      }
    })
  ]);

  const stats = {
    totalBookings,
    activeVehicles,
    newCustomersThisMonth: newCustomers,
    totalRevenue: revenueResult._sum.amount || 0,
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      </div>

      <KPICards stats={stats} />
      
      <Charts />

      <RecentBookingsTable bookings={recentBookings} />
    </>
  );
}
