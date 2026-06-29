"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import styles from "@/styles/components.module.css";
import { SessionUser } from "@/types/user";

export default function BookingSidebar({ vehicleId, locations, user }: { vehicleId: string, locations: any[], user: SessionUser | null }) {
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [pickupLocationId, setPickupLocationId] = useState(locations[0]?.id || "");
  const [dropoffLocationId, setDropoffLocationId] = useState(locations[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login?redirect=/vehicle/" + vehicleId);
      return;
    }

    if (new Date(pickupDate) >= new Date(dropoffDate)) {
      return setError("Drop-off date must be after pick-up date.");
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId, pickupLocationId, dropoffLocationId, pickupDate, dropoffDate
        }),
      });

      if (res.ok) {
        const { booking } = await res.json();
        router.push(`/booking/${booking.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create booking.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.cardGlass} style={{ padding: "32px", position: "sticky", top: "100px" }}>
      <h3 className="heading-md" style={{ marginBottom: "24px" }}>Reserve Vehicle</h3>
      
      {error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "24px", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleBooking}>
        <div className={styles.inputGroup}>
          <label className={styles.label}><Calendar size={14} style={{ display: "inline", marginBottom: "-2px" }}/> Pick-up Date</label>
          <input type="date" required className={styles.input} min={new Date().toISOString().split("T")[0]} value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}><Calendar size={14} style={{ display: "inline", marginBottom: "-2px" }}/> Drop-off Date</label>
          <input type="date" required className={styles.input} min={pickupDate || new Date().toISOString().split("T")[0]} value={dropoffDate} onChange={e => setDropoffDate(e.target.value)} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}><MapPin size={14} style={{ display: "inline", marginBottom: "-2px" }}/> Pick-up Location</label>
          <select className={styles.select} required value={pickupLocationId} onChange={e => setPickupLocationId(e.target.value)}>
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup} style={{ marginBottom: "32px" }}>
          <label className={styles.label}><MapPin size={14} style={{ display: "inline", marginBottom: "-2px" }}/> Drop-off Location</label>
          <select className={styles.select} required value={dropoffLocationId} onChange={e => setDropoffLocationId(e.target.value)}>
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>

        <button type="submit" className={styles.btnPrimary} style={{ width: "100%", padding: "16px", fontSize: "1.125rem" }} disabled={isLoading}>
          {isLoading ? "Checking availability..." : (user ? "Continue to Checkout" : "Log in to Book")}
        </button>
      </form>
    </div>
  );
}
