// Pure business rules for voucher lifecycle (testable without DB).

export type VoucherStatus = "DRAFT" | "POSTED" | "CANCELLED" | "REVERSED";

export function canReverse(status: VoucherStatus): boolean {
  return status === "POSTED";
}

export function canEdit(status: VoucherStatus): boolean {
  return status === "DRAFT";
}

export function canCancel(status: VoucherStatus): boolean {
  // Conservative: drafts can be cancelled; posted financial records must be reversed for auditability.
  return status === "DRAFT";
}

export function assertImmutablePosted(status: VoucherStatus): void {
  if (status === "POSTED" || status === "REVERSED") {
    throw new Error("Posted/reversed vouchers are immutable; create a reversal or adjustment voucher.");
  }
}
