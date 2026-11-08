import { env } from "../config/env.js";

// Dynamic import keeps the API process bootable for DB-independent routes when
// @prisma/client has not been generated/installed yet. Once dependencies are
// installed and `prisma generate` has run, all Prisma models are available.
type AnyPrismaClient = any;
const globalForPrisma = globalThis as unknown as { prisma?: AnyPrismaClient };

export async function getPrisma(): Promise<AnyPrismaClient> {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. Copy server/.env.example to server/.env and set DATABASE_URL.",
    );
  }
  if (!globalForPrisma.prisma) {
    // @ts-ignore - resolved when server dependencies are installed
    const mod = await import("@prisma/client");
    globalForPrisma.prisma = new mod.PrismaClient({
      log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.prisma) await globalForPrisma.prisma.$disconnect();
}
