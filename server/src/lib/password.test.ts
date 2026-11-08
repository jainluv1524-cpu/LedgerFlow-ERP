import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("password (Argon2id)", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("CorrectHorse!BatteryStaple8");
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, "CorrectHorse!BatteryStaple8")).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  }, 15000);
});
