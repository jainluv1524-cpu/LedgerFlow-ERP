// Fixed-scale decimal helpers for financial validation (4 decimal places, matching NUMERIC(19,4)).
// Use these for equality/invariant checks; persist via Prisma Decimal.

const SCALE = 10_000n;

export function toScaled(amount: string | number): bigint {
  if (typeof amount === "number") {
    if (!Number.isFinite(amount)) throw new Error("Amount must be finite");
    // Convert via string to avoid float artifacts in common cases
    return parseDecimalString(amount.toString());
  }
  return parseDecimalString(amount);
}

function parseDecimalString(s: string): bigint {
  const t = s.trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) throw new Error(`Invalid decimal amount: ${s}`);
  const neg = t.startsWith("-");
  const [i, f = ""] = t.replace("-", "").split(".");
  const frac = (f + "0000").slice(0, 4);
  const extra = f.length > 4 ? f.slice(4) : "";
  // Round half-up on the 5th decimal if present
  let scaled = BigInt(i) * SCALE + BigInt(frac);
  if (extra && extra[0] >= "5") scaled += 1n;
  return neg ? -scaled : scaled;
}

export function scaledToString(scaled: bigint): string {
  const neg = scaled < 0n;
  const abs = neg ? -scaled : scaled;
  const i = abs / SCALE;
  const f = (abs % SCALE).toString().padStart(4, "0");
  return `${neg ? "-" : ""}${i}.${f}`;
}

export function isZero(scaled: bigint): boolean {
  return scaled === 0n;
}

export function negateScaled(scaled: bigint): bigint {
  return -scaled;
}
