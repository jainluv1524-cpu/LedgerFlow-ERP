import { getPrisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error-handler.js";
import { scaledToString } from "./money.js";
import { validatePostingEntries } from "./posting-validation.js";
import { buildReversalEntriesSwap } from "./reversal.js";
import { canCancel } from "./voucher-rules.js";
import type { PostVoucherInput, ReverseVoucherInput } from "./schemas.js";

type Tx = any; // Prisma.TransactionClient when client is generated

async function nextVoucherNo(tx: Tx, companyId: string, financialYearId: string, voucherType: string): Promise<string> {
  const last = await tx.voucher.findFirst({
    where: { companyId, financialYearId, voucherType: voucherType as any },
    orderBy: { createdAt: "desc" },
    select: { voucherNo: true },
  });
  const m = last?.voucherNo?.match(/(\d+)$/);
  const n = m ? parseInt(m[1], 10) + 1 : 1;
  return `${voucherType}-${n}`;
}

export async function postVoucher(companyId: string, actorUserId: string, input: PostVoucherInput) {
  const validation = validatePostingEntries(input.entries);
  if (!validation.ok) throw new HttpError(400, validation.code, validation.message);

  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const fy = await tx.financialYear.findFirst({ where: { id: input.financialYearId, companyId } });
    if (!fy) throw new HttpError(404, "FINANCIAL_YEAR_NOT_FOUND", "Financial year not found");
    if (fy.status !== "OPEN") throw new HttpError(409, "FINANCIAL_YEAR_CLOSED", "Financial year is closed");
    const date = new Date(`${input.date}T00:00:00.000Z`);
    if (date < fy.startDate || date > fy.endDate) {
      throw new HttpError(400, "DATE_OUTSIDE_FINANCIAL_YEAR", "Voucher date must be within the selected financial year");
    }

    // Verify ledgers belong to company
    const ledgerIds = [...new Set(input.entries.map((e) => e.ledgerId))];
    const ledgers = await tx.ledger.findMany({ where: { id: { in: ledgerIds }, companyId, isActive: true }, select: { id: true } });
    if (ledgers.length !== ledgerIds.length) throw new HttpError(400, "INVALID_LEDGER", "One or more ledgers are invalid for this company");

    const voucherNo = input.voucherNo?.trim() || await nextVoucherNo(tx, companyId, input.financialYearId, input.voucherType);
    const total = scaledToString(validation.totalDebitScaled);

    const voucher = await tx.voucher.create({
      data: {
        companyId,
        financialYearId: input.financialYearId,
        voucherType: input.voucherType as any,
        voucherNo,
        date,
        narration: input.narration,
        reference: input.reference,
        status: "POSTED",
        totalDebit: total,
        totalCredit: total,
        postedAt: new Date(),
        createdById: actorUserId,
        entries: {
          create: input.entries.map((e, i) => ({
            ledgerId: e.ledgerId,
            debit: typeof e.debit === "number" ? e.debit : e.debit,
            credit: typeof e.credit === "number" ? e.credit : e.credit,
            narration: e.narration,
            lineNo: i + 1,
          })),
        },
      },
      include: { entries: true },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        actorId: actorUserId,
        action: "VOUCHER_POSTED",
        entityType: "Voucher",
        entityId: voucher.id,
        after: { voucherNo: voucher.voucherNo, voucherType: voucher.voucherType, total, status: voucher.status } as any,
      },
    });

    return voucher;
  });
}

export async function reverseVoucher(companyId: string, actorUserId: string, voucherId: string, input: ReverseVoucherInput) {
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const original = await tx.voucher.findFirst({
      where: { id: voucherId, companyId },
      include: { entries: true, reversedBy: true },
    });
    if (!original) throw new HttpError(404, "VOUCHER_NOT_FOUND", "Voucher not found");
    if (original.status !== "POSTED") throw new HttpError(409, "VOUCHER_NOT_REVERSIBLE", "Only posted vouchers can be reversed");
    if (original.reversedBy) throw new HttpError(409, "ALREADY_REVERSED", "Voucher has already been reversed");

    const fy = await tx.financialYear.findFirst({ where: { id: original.financialYearId, companyId } });
    if (!fy || fy.status !== "OPEN") throw new HttpError(409, "FINANCIAL_YEAR_CLOSED", "Financial year is closed");
    const date = new Date(`${input.date}T00:00:00.000Z`);
    if (date < fy.startDate || date > fy.endDate) throw new HttpError(400, "DATE_OUTSIDE_FINANCIAL_YEAR", "Reversal date must be within the financial year");

    const reversalEntries = buildReversalEntriesSwap(original.entries);
    const validation = validatePostingEntries(reversalEntries);
    if (!validation.ok) throw new HttpError(500, "REVERSAL_INVALID", "Generated reversal was not balanced");

    const voucherNo = await nextVoucherNo(tx, companyId, original.financialYearId, original.voucherType);
    const total = scaledToString(validation.totalDebitScaled);

    const reversal = await tx.voucher.create({
      data: {
        companyId,
        financialYearId: original.financialYearId,
        voucherType: original.voucherType,
        voucherNo,
        date,
        narration: input.narration ?? `Reversal of ${original.voucherNo}`,
        reference: input.reference ?? original.id,
        status: "POSTED",
        totalDebit: total,
        totalCredit: total,
        reversesId: original.id,
        postedAt: new Date(),
        createdById: actorUserId,
        entries: { create: reversalEntries.map((e, i) => ({ ledgerId: e.ledgerId, debit: e.debit as any, credit: e.credit as any, narration: e.narration, lineNo: i + 1 })) },
      },
      include: { entries: true },
    });

    await tx.voucher.update({ where: { id: original.id }, data: { status: "REVERSED" } });
    await tx.auditLog.create({
      data: { companyId, actorId: actorUserId, action: "VOUCHER_REVERSED", entityType: "Voucher", entityId: original.id, after: { reversalVoucherId: reversal.id, reversalNo: reversal.voucherNo } as any },
    });
    return reversal;
  });
}

export async function getVoucher(companyId: string, voucherId: string) {
  const prisma = await getPrisma();
  const voucher = await prisma.voucher.findFirst({ where: { id: voucherId, companyId }, include: { entries: true, reversedBy: { select: { id: true, voucherNo: true } } } });
  if (!voucher) throw new HttpError(404, "VOUCHER_NOT_FOUND", "Voucher not found");
  return voucher;
}

export async function listVouchers(companyId: string, query: { financialYearId?: string; limit?: number }) {
  const prisma = await getPrisma();
  return prisma.voucher.findMany({
    where: { companyId, ...(query.financialYearId ? { financialYearId: query.financialYearId } : {}) },
    include: { entries: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: Math.min(query.limit ?? 50, 200),
  });
}

export async function createDraftVoucher(companyId: string, actorUserId: string, input: PostVoucherInput) {
  const validation = validatePostingEntries(input.entries);
  if (!validation.ok) throw new HttpError(400, validation.code, validation.message);
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const fy = await tx.financialYear.findFirst({ where: { id: input.financialYearId, companyId } });
    if (!fy) throw new HttpError(404, "FINANCIAL_YEAR_NOT_FOUND", "Financial year not found");
    const date = new Date(`${input.date}T00:00:00.000Z`);
    const ledgerIds = [...new Set(input.entries.map((e) => e.ledgerId))];
    const ledgers = await tx.ledger.findMany({ where: { id: { in: ledgerIds }, companyId, isActive: true }, select: { id: true } });
    if (ledgers.length !== ledgerIds.length) throw new HttpError(400, "INVALID_LEDGER", "One or more ledgers are invalid for this company");
    const voucherNo = input.voucherNo?.trim() || await nextVoucherNo(tx, companyId, input.financialYearId, input.voucherType);
    const total = scaledToString(validation.totalDebitScaled);
    const voucher = await tx.voucher.create({
      data: {
        companyId, financialYearId: input.financialYearId, voucherType: input.voucherType as any, voucherNo, date,
        narration: input.narration, reference: input.reference, status: "DRAFT", totalDebit: total, totalCredit: total, createdById: actorUserId,
        entries: { create: input.entries.map((e, i) => ({ ledgerId: e.ledgerId, debit: e.debit as any, credit: e.credit as any, narration: e.narration, lineNo: i + 1 })) },
      },
      include: { entries: true },
    });
    await tx.auditLog.create({ data: { companyId, actorId: actorUserId, action: "VOUCHER_DRAFT_CREATED", entityType: "Voucher", entityId: voucher.id, after: { voucherNo, total } as any } });
    return voucher;
  });
}

export async function cancelDraftVoucher(companyId: string, actorUserId: string, voucherId: string) {
  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    const v = await tx.voucher.findFirst({ where: { id: voucherId, companyId } });
    if (!v) throw new HttpError(404, "VOUCHER_NOT_FOUND", "Voucher not found");
    if (!canCancel(v.status as any)) throw new HttpError(409, "CANCEL_NOT_ALLOWED", "Only draft vouchers can be cancelled; posted vouchers must be reversed");
    const updated = await tx.voucher.update({ where: { id: v.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    await tx.auditLog.create({ data: { companyId, actorId: actorUserId, action: "VOUCHER_CANCELLED", entityType: "Voucher", entityId: v.id, before: { status: v.status } as any, after: { status: "CANCELLED" } as any } });
    return updated;
  });
}
