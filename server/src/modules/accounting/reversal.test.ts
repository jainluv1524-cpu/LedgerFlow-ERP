import { describe, expect, it } from "vitest";
import { validatePostingEntries } from "./posting-validation.js";
import { buildReversalEntriesSwap } from "./reversal.js";

describe("reversal entries", () => {
  it("produces a balanced voucher that offsets the original", () => {
    const original = [
      { ledgerId: "cash", debit: "1000.00", credit: "0" },
      { ledgerId: "sales", debit: "0", credit: "1000.00" },
    ];
    const rev = buildReversalEntriesSwap(original);
    expect(validatePostingEntries(rev).ok).toBe(true);
    expect(rev[0]).toMatchObject({ debit: "0", credit: "1000.00" });
    expect(rev[1]).toMatchObject({ debit: "1000.00", credit: "0" });
  });
});
