import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import styles from "@/styles/components.module.css";
import { ChevronRight, CalendarClock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: {
      vehicle: true,
      pickupLocation: true,
      dropoffLocation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ paddingTop: "120px", paddingBottom: "100px", minHeight: "100vh", backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        <div style={{ marginBottom: "48px" }}>
          <h1 className="heading-xl" style={{ marginBottom: "8px" }}>My Dashboard</h1>
          <p className="text-secondary">Welcome back, {user.name}. Manage your bookings here.</p>
        </div>

        <h2 className="heading-lg" style={{ marginBottom: "24px" }}>Your Bookings</h2>

        {bookings.length === 0 ? (
          <div className={styles.cardGlass} style={{ padding: "64px", textAlign: "center" }}>
            <CalendarClock size={48} color="var(--color-text-muted)" style={{ margin: "0 auto 24px" }} />
            <h3 className="heading-md" style={{ marginBottom: "12px" }}>No bookings yet</h3>
            <p className="text-secondary" style={{ marginBottom: "32px" }}>You haven't rented any vehicles with us yet.</p>
            <Link href="/fleet" className={styles.btnPrimary}>Browse Fleet</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
            {bookings.map((b) => (
              <div key={b.id} className={styles.cardGlass} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <style dangerouslySetInnerHTML={{__html: `@media(min-width: 768px) { .dash-row { flex-direction: row !important; align-items: center; justify-content: space-between; } }`}}/>
                
                <div className="dash-row" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Vehicle Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    <div style={{ width: "120px", height: "80px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#e2e8f0", flexShrink: 0 }}>
                      <img src={b.vehicle.images[0] || "https://images.unsplash.com/photo-1503376712341-38caebc863cc?q=80&w=400&auto=format&fit=crop"} alt={b.vehicle.make} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <h3 className="heading-md" style={{ margin: 0, fontSize: "1.25rem", marginBottom: "4px" }}>{b.vehicle.make} {b.vehicle.model}</h3>
                      <div className="text-secondary" style={{ fontSize: "0.875rem" }}>Conf Code: <span style={{ fontFamily: "monospace", color: "#0f172a" }}>{b.confirmationCode}</span></div>
                    </div>
                  </div>

                  {/* Dates & Status */}
                  <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
                    <div>
                      <div className="text-secondary" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Dates</div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        {formatDate(b.pickupDate)} <br/>
                        <span className="text-muted">to</span> {formatDate(b.dropoffDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-secondary" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total</div>
                      <div style={{ fontWeight: 600, color: "var(--color-primary-light)" }}>{formatPrice(b.totalPrice)}</div>
                    </div>
                    <div>
                      <div className="text-secondary" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Status</div>
                      <span className={`${styles.badge} ${
                        b.status === "CONFIRMED" || b.status === "COMPLETED" ? styles.badgeSuccess :
                        b.status === "PENDING" ? styles.badgeWarning :
                        b.status === "CANCELLED" ? styles.badgeDanger : styles.badgeInfo
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action */}
                  {b.status === "PENDING" ? (
                    <Link href={`/booking/${b.id}`} className={styles.btnPrimary} style={{ padding: "8px 16px" }}>
                      Complete Payment <ChevronRight size={16} />
                    </Link>
                  ) : b.status === "CONFIRMED" ? (
                    <button className={styles.btnSecondary} style={{ padding: "8px 16px" }}>
                      Cancel Booking
                    </button>
                  ) : null}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
