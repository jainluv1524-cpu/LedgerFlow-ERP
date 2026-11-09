import { describe, expect, it } from "vitest";
import { canCancel, canEdit, canReverse, assertImmutablePosted } from "./voucher-rules.js";

describe("voucher lifecycle rules", () => {
  it("allows reversing only posted vouchers", () => {
    expect(canReverse("POSTED")).toBe(true);
    expect(canReverse("DRAFT")).toBe(false);
    expect(canReverse("REVERSED")).toBe(false);
  });

  it("allows editing/cancelling only drafts (posted must be reversed)", () => {
    expect(canEdit("DRAFT")).toBe(true);
    expect(canEdit("POSTED")).toBe(false);
    expect(canCancel("DRAFT")).toBe(true);
    expect(canCancel("POSTED")).toBe(false);
  });

  it("guards immutable posted records", () => {
    expect(() => assertImmutablePosted("POSTED")).toThrow();
    expect(() => assertImmutablePosted("REVERSED")).toThrow();
    expect(() => assertImmutablePosted("DRAFT")).not.toThrow();
  });
});
