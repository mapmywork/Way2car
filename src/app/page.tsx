import { db } from "@/lib/db";
import Hero from "@/components/home/Hero";
import QuickSearch from "@/components/home/QuickSearch";
import FeaturedFleet from "@/components/home/FeaturedFleet";
import HowItWorks from "@/components/home/HowItWorks";

// Keep it dynamic so featured fleet is somewhat fresh, 
// though we could revalidate every hour in a real app
export const revalidate = 3600;

export default async function Home() {
  // Fetch up to 4 active vehicles for the featured section
  const vehicles = await db.vehicle.findMany({
    where: { isActive: true },
    include: { location: true },
    take: 4,
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <Hero />
      <QuickSearch />
      <FeaturedFleet vehicles={vehicles} />
      <HowItWorks />
      
      {/* CTA Banner */}
      <section style={{
        padding: "100px 0",
        background: "linear-gradient(135deg, #f1f5f9 0%, #dbeafe 100%)",
        textAlign: "center"
      }}>
        <div className="container">
          <h2 className="heading-xl" style={{ marginBottom: "24px", color: "#0f172a" }}>Ready to Hit the Road?</h2>
          <p style={{ fontSize: "1.25rem", color: "#475569", maxWidth: "600px", margin: "0 auto 40px" }}>
            Join thousands of satisfied customers who have experienced the Way2Car difference.
          </p>
          <a href="/fleet" style={{
            display: "inline-flex", padding: "16px 40px", fontSize: "1.125rem", fontWeight: 600,
            backgroundColor: "#3b82f6", color: "#fff", borderRadius: "99px", textDecoration: "none",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)", transition: "transform 0.2s"
          }}>
            Browse All Vehicles
          </a>
        </div>
      </section>
    </>
  );
}
