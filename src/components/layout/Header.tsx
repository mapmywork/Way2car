"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, Menu, X, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "@/styles/components.module.css";
import { SessionUser } from "@/types/user";

export default function Header({ user }: { user: SessionUser | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If we are not on the homepage, we usually want the header to be solid immediately.
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const headerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 5%",
    zIndex: 100,
    transition: "all 0.3s ease",
    backgroundColor: (!isHomePage || isScrolled) ? "rgba(255, 255, 255, 0.9)" : "transparent",
    backdropFilter: (!isHomePage || isScrolled) ? "blur(12px)" : "none",
    borderBottom: (!isHomePage || isScrolled) ? "1px solid rgba(0,0,0,0.05)" : "1px solid transparent",
  };

  return (
    <>
      <header style={headerStyle}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.5rem", color: (!isHomePage || isScrolled) ? "#0f172a" : "#fff" }}>
          <CarFront color="#3b82f6" size={28} />
          Way2Car
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "none", alignItems: "center", gap: "32px" }} className="desktop-nav">
          <Link href="/fleet" style={{ fontWeight: 500, color: (!isHomePage || isScrolled) ? "#0f172a" : "#f8fafc", transition: "color 0.2s" }} className="nav-link">Our Fleet</Link>
          <Link href="/locations" style={{ fontWeight: 500, color: (!isHomePage || isScrolled) ? "#0f172a" : "#f8fafc", transition: "color 0.2s" }} className="nav-link">Locations</Link>
          <Link href="/about" style={{ fontWeight: 500, color: (!isHomePage || isScrolled) ? "#0f172a" : "#f8fafc", transition: "color 0.2s" }} className="nav-link">About Us</Link>
        </nav>

        {/* Desktop Actions */}
        <div style={{ display: "none", alignItems: "center", gap: "16px" }} className="desktop-nav">
          {user ? (
            <>
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className={styles.btnSecondary} style={{ padding: "8px 16px" }}>
                <User size={18} />
                {user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.btnGhost} style={{ padding: "8px", border: "none", cursor: "pointer" }} title="Sign Out">
                <LogOut size={20} color="#ef4444" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.btnGhost}>Log In</Link>
              <Link href="/auth/register" className={styles.btnPrimary}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: "none", border: "none", color: (!isHomePage || isScrolled) ? "#0f172a" : "#fff", cursor: "pointer", display: "block" }}
          className="mobile-toggle"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: "fixed", top: "80px", left: 0, right: 0, bottom: 0,
          backgroundColor: "#ffffff", zIndex: 99, display: "flex", flexDirection: "column",
          padding: "24px", gap: "24px", animation: "fadeIn 0.2s ease"
        }}>
          <Link href="/fleet" style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0f172a" }}>Our Fleet</Link>
          <Link href="/locations" style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0f172a" }}>Locations</Link>
          <Link href="/about" style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0f172a" }}>About Us</Link>
          
          <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.1)", margin: "16px 0" }} />
          
          {user ? (
            <>
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className={styles.btnPrimary} style={{ width: "100%", justifyContent: "center" }}>
                {user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.btnSecondary} style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Link href="/auth/login" className={styles.btnSecondary} style={{ width: "100%", justifyContent: "center" }}>Log In</Link>
              <Link href="/auth/register" className={styles.btnPrimary} style={{ width: "100%", justifyContent: "center" }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* Inline styles for media queries */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        .nav-link:hover { color: #3b82f6 !important; }
      `}} />
    </>
  );
}
