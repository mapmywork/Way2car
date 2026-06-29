"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/components.module.css";
import { CarFront, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password
        }),
      });

      if (res.ok) {
        // Redirect to login after successful registration
        router.push("/auth/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2966&auto=format&fit=crop') center/cover", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }} />
      
      <div className={styles.cardGlass} style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "440px", padding: "40px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.75rem", color: "#0f172a", marginBottom: "16px" }}>
            <CarFront color="#3b82f6" size={32} />
            Way2Car
          </Link>
          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>Create Account</h1>
          <p className="text-secondary">Join us to start renting premium vehicles</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input 
              type="text" required className={styles.input} placeholder="John Doe"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" required className={styles.input} placeholder="name@example.com"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number (Optional)</label>
            <input 
              type="tel" className={styles.input} placeholder="+91 98765 43210"
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" required className={styles.input} placeholder="••••••••" minLength={6}
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: "24px" }}>
            <label className={styles.label}>Confirm Password</label>
            <input 
              type="password" required className={styles.input} placeholder="••••••••" minLength={6}
              value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ width: "100%", justifyContent: "center", padding: "14px" }} disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Already have an account? <Link href="/auth/login" style={{ color: "#3b82f6", fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
