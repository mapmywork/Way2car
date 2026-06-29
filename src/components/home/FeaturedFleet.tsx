import Link from "next/link";
import { ChevronRight, Users, Fuel, Settings } from "lucide-react";
import styles from "@/styles/components.module.css";
import { formatPrice } from "@/lib/utils";

export default function FeaturedFleet({ vehicles }: { vehicles: any[] }) {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <section style={{ padding: "100px 0", backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
          <div>
            <h2 className="heading-xl" style={{ marginBottom: "16px" }}>Featured Fleet</h2>
            <p className="text-secondary" style={{ fontSize: "1.125rem", maxWidth: "500px" }}>
              Explore our handpicked selection of premium vehicles, ready for your next adventure.
            </p>
          </div>
          <Link href="/fleet" className={styles.btnGhost} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            View All <ChevronRight size={20} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
          {vehicles.map((v) => (
            <Link href={`/vehicle/${v.id}`} key={v.id} className={`${styles.card} ${styles.cardInteractive}`} style={{ display: "flex", flexDirection: "column" }}>
              {/* Image Area */}
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                <img 
                  src={v.images[0] || "https://images.unsplash.com/photo-1503376712341-38caebc863cc?q=80&w=1200&auto=format&fit=crop"} 
                  alt={`${v.make} ${v.model}`} 
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  className="card-image"
                />
                <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 2 }}>
                  <span className={styles.badge} style={{ backgroundColor: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", color: "#0f172a" }}>
                    {v.type}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 className="heading-md" style={{ margin: 0 }}>{v.make} {v.model}</h3>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary-light)" }}>
                      {formatPrice(v.pricePerDay)}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>/day</span>
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: "0.875rem", marginBottom: "24px" }}>
                  {v.year} • {v.location.city}
                </p>

                {/* Specs */}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    <Users size={16} /> {v.seats} Seats
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    <Settings size={16} /> {v.transmission === "AUTOMATIC" ? "Auto" : "Manual"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    <Fuel size={16} /> {v.fuelType === "PETROL" ? "Gas" : v.fuelType === "ELECTRIC" ? "EV" : "Diesel"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .${styles.cardInteractive}:hover .card-image { transform: scale(1.05); }
      `}} />
    </section>
  );
}
