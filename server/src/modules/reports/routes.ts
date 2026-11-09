import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { HttpError } from "../../middleware/error-handler.js";
import { getPrisma } from "../../lib/prisma.js";
import { assertCompanyMember } from "../tenancy/membership.js";
import { computeTrialBalance } from "./trial-balance.js";

export const reportsRouter = Router({ mergeParams: true });
reportsRouter.use(requireAuth);

reportsRouter.get("/trial-balance", async (req, res, next) => {
  try {
    const companyId = req.params.companyId;
    if (!companyId) throw new HttpError(400, "COMPANY_ID_REQUIRED", "companyId is required");
    await assertCompanyMember(req.auth!.userId, companyId);
    const financialYearId = typeof req.query.financialYearId === "string" ? req.query.financialYearId : undefined;
    const prisma = await getPrisma();
    const entries = await prisma.voucherEntry.findMany({
      where: {
        voucher: {
          companyId,
          status: "POSTED",
          ...(financialYearId ? { financialYearId } : {}),
        },
      },
      include: { ledger: { select: { name: true } } },
    });
    const tb = computeTrialBalance(
      entries.map((e: any) => ({
        ledgerId: e.ledgerId,
        ledgerName: e.ledger?.name,
        debit: e.debit?.toString?.() ?? e.debit ?? 0,
        credit: e.credit?.toString?.() ?? e.credit ?? 0,
      })),
    );
    res.json({ data: tb });
  } catch (err) {
    next(err);
  }
});
