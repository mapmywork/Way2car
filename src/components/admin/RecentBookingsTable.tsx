import { formatDate, formatPrice } from "@/lib/utils";
import styles from "@/styles/admin.module.css";
import Link from "next/link";

export default function RecentBookingsTable({ bookings }: { bookings: any[] }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className={styles.card} style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#94a3b8" }}>No recent bookings found.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return styles.badgeSuccess;
      case "PENDING":
        return styles.badgeWarning;
      case "ACTIVE":
        return styles.badgeInfo;
      case "CANCELLED":
        return styles.badgeDanger;
      default:
        return styles.badgeNeutral;
    }
  };

  return (
    <div className={styles.card} style={{ overflow: "hidden", padding: 0 }}>
      <div style={{ padding: "20px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>Recent Bookings</h3>
        <Link href="/admin/bookings" className={styles.btnSecondary} style={{ fontSize: "0.75rem", padding: "6px 12px" }}>
          View All
        </Link>
      </div>
      
      <div className={styles.tableContainer} style={{ border: "none", borderRadius: 0 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ fontFamily: "monospace" }}>{booking.confirmationCode}</td>
                <td>
                  <div>{booking.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{booking.user.email}</div>
                </td>
                <td>{booking.vehicle.make} {booking.vehicle.model}</td>
                <td>
                  <div>{formatDate(booking.pickupDate)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>to {formatDate(booking.dropoffDate)}</div>
                </td>
                <td style={{ fontWeight: 500 }}>{formatPrice(booking.totalPrice)}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
