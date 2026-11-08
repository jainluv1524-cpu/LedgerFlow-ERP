import { isZero, toScaled } from "./money.js";

export type EntryInput = {
  ledgerId: string;
  debit: string | number;
  credit: string | number;
  narration?: string | null;
  lineNo?: number;
};

export type ValidationResult = { ok: true; totalDebitScaled: bigint; totalCreditScaled: bigint } | { ok: false; code: string; message: string };

export function validatePostingEntries(entries: EntryInput[]): ValidationResult {
  if (!Array.isArray(entries) || entries.length < 2) {
    return { ok: false, code: "INVALID_ENTRIES", message: "A voucher must have at least two entries" };
  }
  let totalDr = 0n;
  let totalCr = 0n;
  for (let idx = 0; idx < entries.length; idx++) {
    const e = entries[idx];
    if (!e || typeof e.ledgerId !== "string" || !e.ledgerId) {
      return { ok: false, code: "INVALID_ENTRY", message: `Entry ${idx + 1}: ledgerId is required` };
    }
    let dr: bigint;
    let cr: bigint;
    try {
      dr = toScaled(e.debit ?? 0);
      cr = toScaled(e.credit ?? 0);
    } catch {
      return { ok: false, code: "INVALID_AMOUNT", message: `Entry ${idx + 1}: invalid amount` };
    }
    if (dr < 0n || cr < 0n) {
      return { ok: false, code: "NEGATIVE_AMOUNT", message: `Entry ${idx + 1}: amounts must be non-negative` };
    }
    if (!isZero(dr) && !isZero(cr)) {
      return { ok: false, code: "ENTRY_BOTH_SIDES", message: `Entry ${idx + 1}: an entry line cannot have both debit and credit` };
    }
    if (isZero(dr) && isZero(cr)) {
      return { ok: false, code: "ZERO_ENTRY", message: `Entry ${idx + 1}: debit or credit must be greater than zero` };
    }
    totalDr += dr;
    totalCr += cr;
  }
  if (totalDr !== totalCr) {
    return { ok: false, code: "UNBALANCED_VOUCHER", message: "Total debit must equal total credit" };
  }
  if (isZero(totalDr)) {
    return { ok: false, code: "ZERO_VOUCHER", message: "Voucher total must be greater than zero" };
  }
  return { ok: true, totalDebitScaled: totalDr, totalCreditScaled: totalCr };
}
