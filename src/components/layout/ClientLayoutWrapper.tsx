"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SessionUser } from "@/types/user";

export default function ClientLayoutWrapper({ 
  children, 
  user 
}: { 
  children: React.ReactNode, 
  user: SessionUser | null 
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin routes handle their own layout (Sidebar/Topbar)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header user={user} />
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
