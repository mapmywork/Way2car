"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/components.module.css";
import { CarFront, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
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
          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>Welcome Back</h1>
          <p className="text-secondary">Log in to manage your bookings and rentals</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              required 
              className={styles.input} 
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label}>Password</label>
              <a href="#" style={{ fontSize: "0.75rem", color: "#3b82f6", textDecoration: "none" }}>Forgot password?</a>
            </div>
            <input 
              type="password" 
              required 
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ width: "100%", justifyContent: "center", padding: "14px" }} disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Don't have an account? <Link href="/auth/register" style={{ color: "#3b82f6", fontWeight: 500 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
