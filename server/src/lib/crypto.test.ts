import { describe, expect, it } from "vitest";
import { generateOpaqueToken, sha256Hex } from "./crypto.js";

describe("crypto helpers", () => {
  it("generates url-safe opaque tokens", () => {
    const a = generateOpaqueToken();
    const b = generateOpaqueToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThan(20);
  });

  it("hashes deterministically with sha256 hex", () => {
    expect(sha256Hex("abc")).toBe(sha256Hex("abc"));
    expect(sha256Hex("abc")).not.toBe(sha256Hex("abcd"));
    expect(sha256Hex("abc")).toMatch(/^[a-f0-9]{64}$/);
  });
});
