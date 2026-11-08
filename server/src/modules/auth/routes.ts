import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { clearSessionCookie, login, register, revokeSession, setSessionCookie } from "./service.js";
import { loginSchema, registerSchema } from "./schemas.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await register(input);
    setSessionCookie(res, result.token);
    res.status(201).json({ data: { user: result.user, company: result.company } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input, {
      ipAddress: req.ip,
      userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined,
    });
    setSessionCookie(res, result.token);
    res.json({ data: { user: result.user } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[env.SESSION_COOKIE_NAME];
    if (typeof token === "string" && token) await revokeSession(token);
    clearSessionCookie(res);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({
    data: {
      user: {
        id: req.auth!.user.id,
        email: req.auth!.user.email,
        name: req.auth!.user.name,
      },
      sessionId: req.auth!.sessionId,
    },
  });
});

// CSRF token placeholder (cookie-based sessions should be paired with CSRF protection; full implementation in hardening pass)
authRouter.get("/csrf", (_req, res) => {
  res.json({ data: { csrfProtection: "pending", note: "Use SameSite cookies + CSRF tokens in production hardening." } });
});
