import { Router } from "express";
import { env } from "../config/env.js";
import { getPrisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const payload: {
    status: "ok" | "degraded";
    service: string;
    version: string;
    timestamp: string;
    checks: { database: "ok" | "skipped" | "error" };
  } = {
    status: "ok",
    service: "ledgerflow-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    checks: { database: "skipped" },
  };

  if (env.DATABASE_URL) {
    try {
      const prisma = await getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      payload.checks.database = "ok";
    } catch {
      payload.checks.database = "error";
      payload.status = "degraded";
    }
  }

  res.status(payload.status === "ok" ? 200 : 503).json(payload);
});
