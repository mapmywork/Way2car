"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, User, Menu, LogOut } from "lucide-react";
import styles from "@/styles/admin.module.css";
import { signOut } from "next-auth/react";
import { SessionUser } from "@/types/user";

export default function Topbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  
  // Create a simple breadcrumb from the pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentPage = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) 
    : "Overview";

  return (
    <header className={styles.topbar}>
      <div className={styles.breadcrumbs}>
        <span>Admin</span>
        <span>/</span>
        <span className={styles.breadcrumbActive}>{currentPage}</span>
      </div>

      <div className={styles.userMenu}>
        <span className={styles.userName}>{user.name}</span>
        <button className={styles.iconBtn}>
          <User size={20} />
        </button>
        <button className={styles.iconBtn} onClick={() => signOut({ callbackUrl: '/' })} title="Sign Out">
          <LogOut size={20} color="#ef4444" />
        </button>
      </div>
    </header>
  );
}
