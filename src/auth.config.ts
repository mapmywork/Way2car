import type { NextAuthConfig } from "next-auth";

/**
 * NextAuth Configuration (Edge Compatible).
 * This file doesn't import any Node.js APIs or Database adapters.
 */
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  callbacks: {
    // Determine if the user is allowed to access a given route
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isAuthRoute = nextUrl.pathname.startsWith("/auth");
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isBookingRoute = nextUrl.pathname.startsWith("/booking"); // protected user routes

      // Allow API routes to handle their own auth logic
      if (isApiRoute) return true;

      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirect to home if trying to access login/register while logged in
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        // The middleware will pass them through, but we double-check roles in layout/page
        // Or we can check auth.user.role here if it was appended to the session.
        // We'll handle strict role checks in server components or explicit middleware.
        return true;
      }

      if (isBookingRoute) {
        if (!isLoggedIn) return false; // Redirects to login
        return true;
      }

      return true;
    },
    // Add user ID and role to the JWT token
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore - Custom property from our Prisma adapter
        token.role = user.role;
      }

      // Handle session updates
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    // Expose the added token fields to the client session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // @ts-ignore - Custom property
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
