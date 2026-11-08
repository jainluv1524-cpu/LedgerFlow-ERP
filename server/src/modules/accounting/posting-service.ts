import { getPrisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error-handler.js";
import { scaledToString } from "./money.js";
import { validatePostingEntries } from "./posting-validation.js";
import type { PostVoucherInput } from "./schemas.js";

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
