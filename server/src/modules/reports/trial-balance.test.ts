import { describe, expect, it } from "vitest";
import { computeTrialBalance } from "./trial-balance.js";

describe("computeTrialBalance", () => {
  it("aggregates lines and reports a balanced TB when debits equal credits", () => {
    const tb = computeTrialBalance([
      { ledgerId: "cash", ledgerName: "Cash", debit: 1000, credit: 0 },
      { ledgerId: "sales", ledgerName: "Sales", debit: 0, credit: 1000 },
      { ledgerId: "cash", debit: 200, credit: 0 },
      { ledgerId: "sales", debit: 0, credit: 200 },
    ]);
    expect(tb.balanced).toBe(true);
    expect(tb.totalDebit).toBe(tb.totalCredit);
    expect(tb.rows.find((r) => r.ledgerId === "cash")?.debit).toBe("1200.0000");
  });

  it("detects imbalance (should not happen from valid postings, but calculator must report it)", () => {
    const tb = computeTrialBalance([{ ledgerId: "a", debit: 10, credit: 0 }]);
    expect(tb.balanced).toBe(false);
  });
});
