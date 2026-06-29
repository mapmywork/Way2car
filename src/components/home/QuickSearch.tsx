"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Car } from "lucide-react";
import styles from "@/styles/components.module.css";

export default function QuickSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState("");
  const [type, setType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (type) params.append("type", type);
    // basic date routing just drops them in the search page for now
    router.push(`/fleet?${params.toString()}`);
  };

  return (
    <div style={{
      position: "relative",
      marginTop: "-60px",
      zIndex: 10,
      padding: "0 20px"
    }}>
      <div className={`${styles.cardGlass}`} style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "var(--shadow-xl)"
      }}>
        <form onSubmit={handleSearch} style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          alignItems: "end"
        }}>
          
          <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label} style={{ display: "flex", gap: "6px", alignItems: "center", color: "#0f172a" }}>
              <MapPin size={16} color="var(--color-primary)" /> Pick-up Location
            </label>
            <select className={styles.select} value={location} onChange={e => setLocation(e.target.value)} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <option value="">Any Location</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label} style={{ display: "flex", gap: "6px", alignItems: "center", color: "#0f172a" }}>
              <Calendar size={16} color="var(--color-primary)" /> Dates
            </label>
            {/* Using a simple text input for placeholder since native date range isn't standard, and we want to keep it simple */}
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Select Dates" 
              onFocus={(e) => e.target.type = 'date'} 
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              value={dates}
              onChange={e => setDates(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label} style={{ display: "flex", gap: "6px", alignItems: "center", color: "#0f172a" }}>
              <Car size={16} color="var(--color-primary)" /> Vehicle Type
            </label>
            <select className={styles.select} value={type} onChange={e => setType(e.target.value)} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <option value="">Any Type</option>
              <option value="SUV">SUV</option>
              <option value="SEDAN">Sedan</option>
              <option value="LUXURY">Luxury</option>
            </select>
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ height: "46px" }}>
            <Search size={18} /> Search Fleet
          </button>
        </form>
      </div>
    </div>
  );
}
