import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { SessionUser } from "@/types/user";
import { auth } from "@/auth";

// ─── Auth Helpers — Way2Car ──────────────────────────────────────

/**
 * Get the current server session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current session user with role info.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.user?.email) return null;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  });

  return user as SessionUser | null;
}

/**
 * Require authentication. Redirects to login if not authenticated.
 * Use in server components and route handlers.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * Require admin role. Redirects to home if not an admin.
 * Use in admin route handlers and server components.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

/**
 * Check if the current user is an admin (non-throwing).
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
