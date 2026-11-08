import type { Response } from "express";
import { env } from "../../config/env.js";
import { generateOpaqueToken, sha256Hex } from "../../lib/crypto.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { getPrisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error-handler.js";
import type { LoginInput, RegisterInput } from "./schemas.js";

function sessionExpiry(): Date {
  return new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000);
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: env.SESSION_TTL_SECONDS * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
}

export async function register(input: RegisterInput) {
  const prisma = await getPrisma();
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, "EMAIL_IN_USE", "An account with this email already exists");

  const passwordHash = await hashPassword(input.password);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: input.email, name: input.name, passwordHash },
    });
    const company = await tx.company.create({
      data: { name: input.companyName },
    });
    await tx.companyUser.create({
      data: { companyId: company.id, userId: user.id, isDefault: true },
    });
    // Default financial year (India-style FY can be refined; using current Apr-Mar approximation)
    const now = new Date();
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    await tx.financialYear.create({
      data: {
        companyId: company.id,
        name: `FY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, "0")}`,
        startDate: new Date(Date.UTC(fyStartYear, 3, 1)),
        endDate: new Date(Date.UTC(fyStartYear + 1, 2, 31)),
      },
    });
    const token = generateOpaqueToken();
    await tx.session.create({
      data: {
        userId: user.id,
        tokenHash: sha256Hex(token),
        expiresAt: sessionExpiry(),
      },
    });
    return { user, company, token };
  });

  return {
    token: result.token,
    user: { id: result.user.id, email: result.user.email, name: result.user.name },
    company: { id: result.company.id, name: result.company.name },
  };
}

export async function login(input: LoginInput, meta: { ipAddress?: string; userAgent?: string }) {
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const ok = user && (await verifyPassword(user.passwordHash, input.password));
  await prisma.loginHistory.create({
    data: {
      userId: user?.id,
      email: input.email,
      success: !!ok,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      reason: ok ? null : "INVALID_CREDENTIALS",
    },
  });
  if (!ok || !user) throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  if (user.status !== "ACTIVE") throw new HttpError(403, "ACCOUNT_INACTIVE", "Account is not active");

  const token = generateOpaqueToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(token),
      expiresAt: sessionExpiry(),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function getSessionUser(token: string) {
  const prisma = await getPrisma();
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256Hex(token) },
    include: { user: true },
  });
  if (!session || session.status !== "ACTIVE" || session.expiresAt < new Date()) return null;
  if (session.user.status !== "ACTIVE") return null;
  return { session, user: session.user };
}

export async function revokeSession(token: string): Promise<void> {
  const prisma = await getPrisma();
  await prisma.session.updateMany({
    where: { tokenHash: sha256Hex(token), status: "ACTIVE" },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
}
