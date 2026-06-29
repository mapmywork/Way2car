import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import styles from "@/styles/components.module.css";
import Link from "next/link";
import { ShieldCheck, Calendar, MapPin, CreditCard } from "lucide-react";

export default async function BookingCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAuth();

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      vehicle: true,
      pickupLocation: true,
      dropoffLocation: true,
      payment: true,
    }
  });

  if (!booking) notFound();
  if (booking.userId !== user.id) redirect("/");
  
  if (booking.status !== "PENDING") {
    // Already paid or cancelled
    return (
      <div style={{ paddingTop: "120px", paddingBottom: "100px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className={styles.cardGlass} style={{ padding: "48px", textAlign: "center", maxWidth: "600px" }}>
          <h2 className="heading-xl" style={{ marginBottom: "16px" }}>Booking {booking.status}</h2>
          <p className="text-secondary" style={{ marginBottom: "32px", fontSize: "1.125rem" }}>
            This booking is no longer pending payment. Please check your dashboard for details.
          </p>
          <Link href="/dashboard" className={styles.btnPrimary}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Next steps: Integrate Razorpay checkout script here.
  // For Phase 4 demonstration, we'll build the UI shell. 
  // Integrating the full Razorpay flow requires the external `<script>` injection and API keys.

  return (
    <div style={{ paddingTop: "120px", paddingBottom: "100px", minHeight: "100vh", backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        <div style={{ marginBottom: "40px" }}>
          <h1 className="heading-xl" style={{ marginBottom: "8px" }}>Secure Checkout</h1>
          <p className="text-secondary">Complete your reservation for {booking.vehicle.make} {booking.vehicle.model}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
          <style dangerouslySetInnerHTML={{__html: `@media(min-width: 768px) { .checkout-grid { grid-template-columns: 1.5fr 1fr !important; } }`}}/>
          
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", alignItems: "start" }}>
            
            {/* Left: Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className={styles.cardGlass} style={{ padding: "32px" }}>
                <h3 className="heading-md" style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={20} color="var(--color-primary)" /> Trip Details
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div className="text-secondary" style={{ fontSize: "0.875rem", marginBottom: "8px" }}>Pick-up</div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>{formatDate(booking.pickupDate)}</div>
                    <div className="text-muted" style={{ fontSize: "0.875rem" }}><MapPin size={14} style={{display: "inline"}}/> {booking.pickupLocation.name}</div>
                  </div>
                  <div>
                    <div className="text-secondary" style={{ fontSize: "0.875rem", marginBottom: "8px" }}>Drop-off</div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>{formatDate(booking.dropoffDate)}</div>
                    <div className="text-muted" style={{ fontSize: "0.875rem" }}><MapPin size={14} style={{display: "inline"}}/> {booking.dropoffLocation.name}</div>
                  </div>
                </div>
              </div>

              <div className={styles.cardGlass} style={{ padding: "32px" }}>
                <h3 className="heading-md" style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={20} color="var(--color-primary)" /> Protection & Extras
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Standard Insurance</div>
                    <div className="text-muted" style={{ fontSize: "0.875rem" }}>Included in price</div>
                  </div>
                  <div className={styles.badge} style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#34d399" }}>Included</div>
                </div>
              </div>
            </div>

            {/* Right: Payment */}
            <div className={styles.cardGlass} style={{ padding: "32px", position: "sticky", top: "100px" }}>
              <h3 className="heading-md" style={{ marginBottom: "24px" }}>Price Breakdown</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-secondary">Rental Rate</span>
                  <span>{formatPrice(booking.totalPrice - booking.taxAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-secondary">Taxes & Fees</span>
                  <span>{formatPrice(booking.taxAmount)}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "24px", borderTop: "1px solid var(--color-border)", marginBottom: "32px" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>Total Due</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary-light)" }}>{formatPrice(booking.totalPrice)}</span>
              </div>

              <button className={styles.btnPrimary} style={{ width: "100%", padding: "16px", fontSize: "1.125rem", display: "flex", justifyContent: "center", gap: "12px" }}>
                <CreditCard size={20} /> Pay with Razorpay
              </button>

              <p className="text-muted" style={{ fontSize: "0.75rem", textAlign: "center", marginTop: "16px", lineHeight: 1.5 }}>
                By clicking pay, you agree to our Terms of Service and Rental Agreement. Payments are securely processed.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
