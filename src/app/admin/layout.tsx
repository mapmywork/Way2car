
import { requireAdmin } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import styles from "@/styles/admin.module.css";

export const metadata = {
  title: "Admin Dashboard | Way2Car",
  description: "Internal management dashboard for Way2Car",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all /admin routes
  const user = await requireAdmin();

  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <Topbar user={user} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
