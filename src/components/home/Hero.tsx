import Link from "next/link";
import styles from "@/styles/components.module.css";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section style={{
      position: "relative",
      height: "85vh",
      minHeight: "600px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }}>
      {/* Background Image & Overlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2915&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to bottom, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.8) 100%)",
        zIndex: 1
      }} />

      {/* Content */}
      <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center", paddingTop: "80px" }}>
        <h1 className="heading-display animate-slide-up" style={{ color: "#ffffff", marginBottom: "24px" }}>
          Drive Your <span style={{ color: "var(--color-primary)" }}>Dream.</span>
        </h1>
        <p className="heading-md animate-slide-up delay-100" style={{ color: "rgba(255,255,255,0.8)", maxWidth: "700px", margin: "0 auto 40px", fontWeight: 400 }}>
          Experience the thrill of the open road with our premium fleet. Luxury, performance, and comfort delivered to your doorstep.
        </p>
        
        <div className="animate-slide-up delay-200" style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/fleet" className={styles.btnPrimary} style={{ padding: "16px 32px", fontSize: "1.125rem", borderRadius: "99px" }}>
            Browse Fleet <ChevronRight size={20} />
          </Link>
          <Link href="#how-it-works" className={styles.btnSecondary} style={{ padding: "16px 32px", fontSize: "1.125rem", borderRadius: "99px" }}>
            How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
