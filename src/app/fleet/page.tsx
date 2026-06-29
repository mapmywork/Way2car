import { db } from "@/lib/db";
import Link from "next/link";
import { Users, Fuel, Settings, MapPin } from "lucide-react";
import styles from "@/styles/components.module.css";
import { formatPrice } from "@/lib/utils";

// Prevent static generation so search params work properly
export const dynamic = "force-dynamic";

export default async function FleetPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { location, type } = searchParams;

  const where: any = { isActive: true };
  if (location) {
    where.location = { city: { contains: location, mode: "insensitive" } };
  }
  if (type) {
    where.type = type;
  }

  const vehicles = await db.vehicle.findMany({
    where,
    include: { location: true },
    orderBy: { pricePerDay: "asc" },
  });

  return (
    <div style={{ paddingTop: "120px", paddingBottom: "100px", minHeight: "100vh", backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: "48px" }}>
          <h1 className="heading-xl" style={{ marginBottom: "16px" }}>Our Fleet</h1>
          <p className="text-secondary" style={{ fontSize: "1.125rem", maxWidth: "600px" }}>
            {vehicles.length} premium vehicles available matching your criteria.
          </p>
        </div>

        {/* Filters & Results Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
          
          {vehicles.length === 0 ? (
            <div className={styles.cardGlass} style={{ padding: "64px", textAlign: "center" }}>
              <h3 className="heading-lg" style={{ marginBottom: "16px" }}>No vehicles found</h3>
              <p className="text-secondary" style={{ marginBottom: "24px" }}>Try adjusting your search criteria.</p>
              <Link href="/fleet" className={styles.btnPrimary}>Clear Filters</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
              {vehicles.map((v) => (
                <Link href={`/vehicle/${v.id}`} key={v.id} className={`${styles.card} ${styles.cardInteractive}`} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                    <img 
                      src={v.images[0] || "https://images.unsplash.com/photo-1503376712341-38caebc863cc?q=80&w=1200&auto=format&fit=crop"} 
                      alt={`${v.make} ${v.model}`} 
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                      className="card-image"
                    />
                    <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 2 }}>
                      <span className={styles.badge} style={{ backgroundColor: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", color: "#0f172a" }}>
                        {v.type}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 className="heading-lg" style={{ margin: 0, fontSize: "1.25rem" }}>{v.make} {v.model}</h3>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary-light)" }}>
                          {formatPrice(v.pricePerDay)}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>/day</span>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "24px" }}>
                      <MapPin size={14} /> {v.location.name}, {v.location.city}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        <Users size={16} /> {v.seats}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        <Settings size={16} /> {v.transmission === "AUTOMATIC" ? "Auto" : "Manual"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        <Fuel size={16} /> {v.fuelType === "PETROL" ? "Gas" : "Diesel"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .${styles.cardInteractive}:hover .card-image { transform: scale(1.05); }
      `}} />
    </div>
  );
}
