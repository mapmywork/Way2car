import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Users, Fuel, Settings, Check, MapPin } from "lucide-react";
import BookingSidebar from "@/components/vehicle/BookingSidebar";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import styles from "@/styles/components.module.css";
import { SessionUser } from "@/types/user";

export default async function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [vehicle, locations, session] = await Promise.all([
    db.vehicle.findUnique({ where: { id }, include: { location: true } }),
    db.location.findMany({ where: { isActive: true } }),
    getSession(),
  ]);

  if (!vehicle) {
    notFound();
  }

  // Parse features safely since it's JSON
  const features = typeof vehicle.features === 'string' 
    ? JSON.parse(vehicle.features) 
    : vehicle.features || {};

  const featureList = Object.keys(features).filter(k => features[k]);

  return (
    <div style={{ backgroundColor: "var(--color-bg-primary)", minHeight: "100vh" }}>
      {/* Hero Image */}
      <div style={{ position: "relative", height: "60vh", minHeight: "400px", width: "100%", backgroundColor: "#0f172a" }}>
        <img 
          src={vehicle.images[0] || "https://images.unsplash.com/photo-1503376712341-38caebc863cc?q=80&w=2915&auto=format&fit=crop"} 
          alt={`${vehicle.make} ${vehicle.model}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, var(--color-bg-primary) 0%, transparent 100%)" }} />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 10, marginTop: "-100px", paddingBottom: "100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px" }}>
          <style dangerouslySetInnerHTML={{__html: `@media(min-width: 1024px) { .grid-col { grid-template-columns: 2fr 1fr !important; } }`}}/>
          
          <div className="grid-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px", alignItems: "start" }}>
            
            {/* Left Col: Details */}
            <div>
              <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span className={styles.badge} style={{ backgroundColor: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>{vehicle.type}</span>
                  <span style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem" }}>
                    <MapPin size={16} /> {vehicle.location.name}, {vehicle.location.city}
                  </span>
                </div>
                <h1 className="heading-xl" style={{ marginBottom: "16px" }}>{vehicle.make} {vehicle.model}</h1>
                <div style={{ fontSize: "1.25rem", color: "var(--color-text-secondary)" }}>{vehicle.year}</div>
              </div>

              {/* Specs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                <div className={styles.cardGlass} style={{ padding: "20px", textAlign: "center" }}>
                  <Users size={24} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Seats</div>
                  <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{vehicle.seats}</div>
                </div>
                <div className={styles.cardGlass} style={{ padding: "20px", textAlign: "center" }}>
                  <Settings size={24} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Transmission</div>
                  <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{vehicle.transmission === "AUTOMATIC" ? "Auto" : "Manual"}</div>
                </div>
                <div className={styles.cardGlass} style={{ padding: "20px", textAlign: "center" }}>
                  <Fuel size={24} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Fuel Type</div>
                  <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{vehicle.fuelType === "PETROL" ? "Gas" : "Diesel"}</div>
                </div>
              </div>

              <div style={{ marginBottom: "48px" }}>
                <h3 className="heading-lg" style={{ marginBottom: "20px" }}>Description</h3>
                <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: "1.125rem" }}>
                  {vehicle.description}
                </p>
              </div>

              <div>
                <h3 className="heading-lg" style={{ marginBottom: "20px" }}>Features</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {featureList.map((feat) => (
                    <li key={feat} style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--color-text-secondary)" }}>
                      <div style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#34d399", padding: "4px", borderRadius: "50%" }}>
                        <Check size={16} />
                      </div>
                      <span style={{ textTransform: "capitalize" }}>{feat.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Booking Sidebar */}
            <div>
              <BookingSidebar 
                vehicleId={vehicle.id} 
                locations={locations} 
                user={(session?.user as SessionUser) || null} 
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
