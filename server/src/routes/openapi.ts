import type { Request, Response } from "express";
import { env } from "../config/env.js";

export function openApiHandler(_req: Request, res: Response): void {
  res.json({
    openapi: "3.1.0",
    info: { title: "LedgerFlow API", version: "0.1.0-foundation", description: "Phase 2 foundation. Expand with module schemas as implemented." },
    servers: [{ url: env.API_BASE_PATH }],
    paths: {
      "/health": { get: { summary: "Health check", responses: { "200": { description: "OK" }, "503": { description: "Degraded" } } } },
      "/auth/register": { post: { summary: "Register user and bootstrap company (foundation)", responses: { "201": { description: "Created" } } } },
      "/auth/login": { post: { summary: "Login", responses: { "200": { description: "OK" } } } },
      "/auth/logout": { post: { summary: "Logout", responses: { "200": { description: "OK" } } } },
      "/auth/me": { get: { summary: "Current user", responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } } } },
    },
  });
}
