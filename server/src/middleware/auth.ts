import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { getSessionUser } from "../modules/auth/service.js";
import { HttpError } from "./error-handler.js";

export async function attachUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[env.SESSION_COOKIE_NAME];
    if (typeof token === "string" && token) {
      const found = await getSessionUser(token);
      if (found) {
        req.auth = { userId: found.user.id, sessionId: found.session.id, user: found.user };
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(new HttpError(401, "UNAUTHORIZED", "Authentication required"));
  next();
}
