"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { 
  LayoutDashboard, 
  CarFront, 
  CalendarCheck, 
  MapPin, 
  Menu,
  ChevronLeft
} from "lucide-react";
import styles from "@/styles/admin.module.css";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Vehicles", href: "/admin/vehicles", icon: CarFront },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={clsx(styles.sidebar, isCollapsed && styles.sidebarCollapsed)}>
      <div className={styles.sidebarHeader}>
        <Link href="/admin" className={styles.logo}>
          <CarFront className={styles.logoIcon} />
          <span className={styles.navLabel}>Way2Car</span>
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseBtn}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.navItem, isActive && styles.navItemActive)}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
