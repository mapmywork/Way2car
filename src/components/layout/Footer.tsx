import Link from "next/link";
import { CarFront, Globe, MessageCircle, Share2, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#f8fafc", paddingTop: "80px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", paddingBottom: "60px" }}>
        
        {/* Brand */}
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.5rem", color: "#0f172a", marginBottom: "20px" }}>
            <CarFront color="#3b82f6" size={28} />
            Way2Car
          </Link>
          <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: "24px" }}>
            Experience the thrill of the drive. Premium car rentals for those who appreciate luxury, performance, and uncompromising quality.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="social-link"><Globe size={20} /></a>
            <a href="#" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="social-link"><MessageCircle size={20} /></a>
            <a href="#" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="social-link"><Share2 size={20} /></a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ color: "#0f172a", fontWeight: 600, fontSize: "1.125rem", marginBottom: "24px" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <li><Link href="/fleet" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">Browse Fleet</Link></li>
            <li><Link href="/locations" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">Our Locations</Link></li>
            <li><Link href="/about" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">About Us</Link></li>
            <li><Link href="/faq" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">FAQ & Support</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ color: "#0f172a", fontWeight: 600, fontSize: "1.125rem", marginBottom: "24px" }}>Legal</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <li><Link href="/terms" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">Terms & Conditions</Link></li>
            <li><Link href="/privacy" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">Privacy Policy</Link></li>
            <li><Link href="/rental-agreement" style={{ color: "#94a3b8", transition: "color 0.2s" }} className="footer-link">Rental Agreement</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: "#0f172a", fontWeight: 600, fontSize: "1.125rem", marginBottom: "24px" }}>Contact Us</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "#94a3b8" }}>
              <MapPin size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>123 Luxury Drive, Automotiva Park,<br/>New Delhi, India 110001</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8" }}>
              <Phone size={20} color="#3b82f6" />
              <span>+91 98765 43210</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8" }}>
              <Mail size={20} color="#3b82f6" />
              <span>support@way2car.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
          &copy; {new Date().getFullYear()} Way2Car Rentals. All rights reserved.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .footer-link:hover { color: #3b82f6 !important; }
        .social-link:hover { color: #0f172a !important; }
      `}} />
    </footer>
  );
}
