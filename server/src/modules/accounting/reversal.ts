import { negateScaled, scaledToString, toScaled } from "./money.js";

export type EntryLike = { ledgerId: string; debit: any; credit: any; narration?: string | null };

/** Builds reversal lines (swap/negate effect) so total debit = total credit remains true. */
export function buildReversalEntries(entries: EntryLike[]) {
  return entries.map((e, i) => {
    const dr = toScaled(e.debit ?? 0);
    const cr = toScaled(e.credit ?? 0);
    // Reverse by swapping sides: original Dr -> reversal Cr, original Cr -> reversal Dr
    return {
      ledgerId: e.ledgerId,
      debit: scaledToString(negateScaled(cr) < 0n ? 0n : negateScaled(cr) === 0n ? dr : 0n),
      credit: scaledToString(negateScaled(dr) < 0n ? 0n : negateScaled(dr) === 0n ? cr : 0n),
      narration: e.narration ? `Reversal: ${e.narration}` : "Reversal entry",
      lineNo: i + 1,
    };
  });
}

/** Simpler correct reversal: debit becomes credit amount and vice versa. */
export function buildReversalEntriesSwap(entries: EntryLike[]) {
  return entries.map((e, i) => ({
    ledgerId: e.ledgerId,
    debit: typeof e.credit === "object" && e.credit?.toString ? e.credit.toString() : String(e.credit ?? 0),
    credit: typeof e.debit === "object" && e.debit?.toString ? e.debit.toString() : String(e.debit ?? 0),
    narration: e.narration ? `Reversal: ${e.narration}` : "Reversal entry",
    lineNo: i + 1,
  }));
}
