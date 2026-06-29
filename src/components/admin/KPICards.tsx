import { 
  TrendingUp, 
  Users, 
  Car, 
  CalendarCheck 
} from "lucide-react";
import styles from "@/styles/admin.module.css";
import { formatPrice } from "@/lib/utils";

interface KPICardsProps {
  stats: {
    totalBookings: number;
    activeVehicles: number;
    newCustomersThisMonth: number;
    totalRevenue: number;
  };
}

export default function KPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: "#10b981", // Emerald
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      icon: CalendarCheck,
      color: "#3b82f6", // Blue
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Active Fleet",
      value: stats.activeVehicles.toString(),
      icon: Car,
      color: "#f59e0b", // Amber
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "New Customers",
      value: stats.newCustomersThisMonth.toString(),
      icon: Users,
      color: "#8b5cf6", // Purple
      bg: "rgba(139, 92, 246, 0.1)",
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              backgroundColor: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>{card.title}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
