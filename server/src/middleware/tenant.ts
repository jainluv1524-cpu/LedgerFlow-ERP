import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "./error-handler.js";

const uuid = z.string().uuid();

/**
 * Resolves tenant context for company-scoped routes.
 * Phase 2 foundation: accepts x-company-id header. Later: validate membership via CompanyUser.
 */
export function requireTenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(new HttpError(401, "UNAUTHORIZED", "Authentication required"));
  const raw = req.header("x-company-id");
  if (!raw) return next(new HttpError(400, "COMPANY_CONTEXT_REQUIRED", "x-company-id header is required"));
  const parsed = uuid.safeParse(raw);
  if (!parsed.success) return next(new HttpError(400, "INVALID_COMPANY_ID", "Invalid company id"));
  // TODO (Phase 3): verify req.auth.userId is a member of companyId before trusting.
  req.tenant = { companyId: parsed.data };
  next();
}
