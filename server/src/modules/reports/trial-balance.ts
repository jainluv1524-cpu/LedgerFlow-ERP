import { toScaled, scaledToString } from "../accounting/money.js";

export type TbLine = { ledgerId: string; ledgerName?: string; debit: string | number; credit: string | number };

export function computeTrialBalance(lines: TbLine[]) {
  const byLedger = new Map<string, { ledgerId: string; ledgerName?: string; debit: bigint; credit: bigint }>();
  for (const l of lines) {
    const cur = byLedger.get(l.ledgerId) ?? { ledgerId: l.ledgerId, ledgerName: l.ledgerName, debit: 0n, credit: 0n };
    cur.debit += toScaled(l.debit ?? 0);
    cur.credit += toScaled(l.credit ?? 0);
    if (l.ledgerName) cur.ledgerName = l.ledgerName;
    byLedger.set(l.ledgerId, cur);
  }
  const rows = [...byLedger.values()].map((r) => ({
    ledgerId: r.ledgerId,
    ledgerName: r.ledgerName,
    debit: scaledToString(r.debit),
    credit: scaledToString(r.credit),
  }));
  const totalDebit = rows.reduce((a, r) => a + toScaled(r.debit), 0n);
  const totalCredit = rows.reduce((a, r) => a + toScaled(r.credit), 0n);
  return {
    rows,
    totalDebit: scaledToString(totalDebit),
    totalCredit: scaledToString(totalCredit),
    balanced: totalDebit === totalCredit,
  };
}
