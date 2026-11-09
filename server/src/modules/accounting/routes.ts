import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { HttpError } from "../../middleware/error-handler.js";
import { assertCompanyMember } from "../tenancy/membership.js";
import { createAccountGroup, createLedger, listAccountGroups, listLedgers } from "./coa-service.js";
import { createAccountGroupSchema, createLedgerSchema } from "./coa-schemas.js";
import { cancelDraftVoucher, createDraftVoucher, getVoucher, listVouchers, postVoucher, reverseVoucher } from "./posting-service.js";
import { postVoucherSchema, reverseVoucherSchema } from "./schemas.js";

export const accountingRouter = Router({ mergeParams: true });

// All accounting routes require auth; company membership verified per request.
accountingRouter.use(requireAuth);

accountingRouter.post("/vouchers", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    const input = postVoucherSchema.parse(req.body);
    const voucher = await postVoucher(companyId, req.auth!.userId, input);
    res.status(201).json({ data: { voucher } });
  } catch (err) { next(err); }
});

accountingRouter.post("/vouchers/draft", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    const voucher = await createDraftVoucher(companyId, req.auth!.userId, postVoucherSchema.parse(req.body));
    res.status(201).json({ data: { voucher } });
  } catch (err) { next(err); }
});

accountingRouter.post("/vouchers/:voucherId/cancel", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    res.json({ data: { voucher: await cancelDraftVoucher(companyId, req.auth!.userId, req.params.voucherId) } });
  } catch (err) { next(err); }
});

accountingRouter.get("/vouchers/validate", (_req, res) => {
  res.json({
    data: {
      message: "POST /vouchers with balanced double-entry lines. Validation enforces total debit = total credit.",
      rules: ["min 2 entries", "each line debit XOR credit", "non-negative", "server-computed totals", "FY must be open", "posted vouchers immutable; reverse to correct"],
    },
  });
});

accountingRouter.get("/vouchers", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    const data = await listVouchers(companyId, { financialYearId: req.query.financialYearId as string | undefined });
    res.json({ data });
  } catch (err) { next(err); }
});

accountingRouter.get("/vouchers/:voucherId", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    const data = await getVoucher(companyId, req.params.voucherId);
    res.json({ data });
  } catch (err) { next(err); }
});

accountingRouter.post("/vouchers/:voucherId/reverse", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    const input = reverseVoucherSchema.parse(req.body);
    const data = await reverseVoucher(companyId, req.auth!.userId, req.params.voucherId, input);
    res.status(201).json({ data: { voucher: data } });
  } catch (err) { next(err); }
});

accountingRouter.get("/account-groups", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    res.json({ data: await listAccountGroups(companyId) });
  } catch (err) { next(err); }
});

accountingRouter.post("/account-groups", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    res.status(201).json({ data: await createAccountGroup(companyId, createAccountGroupSchema.parse(req.body)) });
  } catch (err) { next(err); }
});

accountingRouter.get("/ledgers", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    res.json({ data: await listLedgers(companyId) });
  } catch (err) { next(err); }
});

accountingRouter.post("/ledgers", async (req, res, next) => {
  try {
    const companyId = req.params.companyId!;
    await assertCompanyMember(req.auth!.userId, companyId);
    res.status(201).json({ data: await createLedger(companyId, createLedgerSchema.parse(req.body)) });
  } catch (err) { next(err); }
});
