import { describe, expect, it } from "vitest";
import { validatePostingEntries } from "./posting-validation.js";

describe("validatePostingEntries (double-entry)", () => {
  it("accepts a balanced voucher", () => {
    const res = validatePostingEntries([
      { ledgerId: "l1", debit: 1000, credit: 0 },
      { ledgerId: "l2", debit: 0, credit: 1000 },
    ]);
    expect(res.ok).toBe(true);
  });

  it("accepts decimal amounts that balance", () => {
    const res = validatePostingEntries([
      { ledgerId: "l1", debit: "100.25", credit: 0 },
      { ledgerId: "l2", debit: "49.75", credit: 0 },
      { ledgerId: "l3", debit: 0, credit: "150.00" },
    ]);
    expect(res.ok).toBe(true);
  });

  it("rejects unbalanced vouchers", () => {
    const res = validatePostingEntries([
      { ledgerId: "l1", debit: 100, credit: 0 },
      { ledgerId: "l2", debit: 0, credit: 99 },
    ]);
    expect(res).toMatchObject({ ok: false, code: "UNBALANCED_VOUCHER" });
  });

  it("rejects a line with both debit and credit", () => {
    const res = validatePostingEntries([
      { ledgerId: "l1", debit: 50, credit: 50 },
      { ledgerId: "l2", debit: 0, credit: 100 },
    ]);
    expect(res).toMatchObject({ ok: false, code: "ENTRY_BOTH_SIDES" });
  });

  it("rejects negative amounts", () => {
    const res = validatePostingEntries([
      { ledgerId: "l1", debit: -1, credit: 0 },
      { ledgerId: "l2", debit: 0, credit: -1 },
    ]);
    expect(res.ok).toBe(false);
  });

  it("rejects fewer than two entries", () => {
    expect(validatePostingEntries([{ ledgerId: "l1", debit: 1, credit: 0 }])).toMatchObject({ ok: false });
  });

  it("rejects zero-value lines", () => {
    const res = validatePostingEntries([
      { ledgerId: "l1", debit: 0, credit: 0 },
      { ledgerId: "l2", debit: 0, credit: 0 },
    ]);
    expect(res.ok).toBe(false);
  });
});
