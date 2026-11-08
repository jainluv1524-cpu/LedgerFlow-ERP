import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_BASE_PATH: z.string().default("/api/v1"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(16).default("dev-only-replace-session-secret"),
  SESSION_COOKIE_NAME: z.string().default("lf_session"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(28800),
  ENABLE_SWAGGER: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
