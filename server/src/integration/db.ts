import { env } from "../config/env.js";

export function hasDatabase(): boolean {
  return !!env.DATABASE_URL && process.env.RUN_DB_TESTS === "true";
}

export const describeIfDb = hasDatabase() ? describe : describe.skip;
// Note: import { describe } from 'vitest' in test files and use describe.runIf(hasDatabase()) for clarity.
