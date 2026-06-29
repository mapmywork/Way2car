import { PrismaClient } from "@prisma/client";

// ─── Prisma Client Singleton ─────────────────────────────────────
// Prevents multiple Prisma Client instances in development
// (Next.js hot-reload creates new modules on each change).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
