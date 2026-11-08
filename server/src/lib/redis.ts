import { env } from "../config/env.js";

// Phase 2 foundation: Redis is configured but not required for core auth flows yet.
// Use this module for caching, rate-limit stores, and background jobs when wired.
export function getRedisUrl(): string | null {
  return env.REDIS_URL ?? null;
}

export function isRedisConfigured(): boolean {
  return !!env.REDIS_URL;
}
