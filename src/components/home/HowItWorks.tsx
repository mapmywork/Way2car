import { Search, CalendarCheck, Car } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Find Your Car",
      desc: "Browse our premium fleet and filter by location, date, and vehicle type to find the perfect match."
    },
    {
      icon: CalendarCheck,
      title: "Book & Pay",
      desc: "Select your dates, add optional extras, and securely complete your payment in seconds."
    },
    {
      icon: Car,
      title: "Hit the Road",
      desc: "Pick up your vehicle from the designated location and enjoy the ultimate driving experience."
    }
  ];

  return (
    <section id="how-it-works" style={{ padding: "100px 0", backgroundColor: "#f8fafc", position: "relative", overflow: "hidden" }}>
      {/* Decorative background circle */}
      <div style={{
        position: "absolute",
        top: "-20%", left: "-10%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)",
        pointerEvents: "none"
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <h2 className="heading-xl" style={{ marginBottom: "16px" }}>How It Works</h2>
        <p className="text-secondary" style={{ fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto 64px" }}>
          Renting a luxury vehicle has never been easier. We've streamlined the process so you can get behind the wheel faster.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "48px" }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "80px", height: "80px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 100%)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "24px",
                  color: "#3b82f6",
                  position: "relative"
                }}>
                  {/* Step Number Badge */}
                  <div style={{
                    position: "absolute", top: "-10px", right: "-10px",
                    width: "28px", height: "28px", borderRadius: "50%",
                    backgroundColor: "#3b82f6", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem", fontWeight: 700,
                    boxShadow: "0 0 10px rgba(59,130,246,0.5)"
                  }}>
                    {i + 1}
                  </div>
                  <Icon size={32} />
                </div>
                <h3 className="heading-md" style={{ marginBottom: "12px" }}>{step.title}</h3>
                <p className="text-secondary" style={{ lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
