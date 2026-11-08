import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { HttpError } from "../../middleware/error-handler.js";
import { assertCompanyMember } from "../tenancy/membership.js";
import { postVoucher } from "./posting-service.js";
import { postVoucherSchema } from "./schemas.js";

export const accountingRouter = Router({ mergeParams: true });

// All accounting routes require auth; company membership verified per request.
accountingRouter.use(requireAuth);

accountingRouter.post("/vouchers", async (req, res, next) => {
  try {
    const companyId = req.params.companyId;
    if (!companyId) throw new HttpError(400, "COMPANY_ID_REQUIRED", "companyId is required");
    await assertCompanyMember(req.auth!.userId, companyId);
    const input = postVoucherSchema.parse(req.body);
    const voucher = await postVoucher(companyId, req.auth!.userId, input);
    res.status(201).json({ data: { voucher } });
  } catch (err) {
    next(err);
  }
});

accountingRouter.get("/vouchers/validate", (_req, res) => {
  res.json({
    data: {
      message: "POST /vouchers with balanced double-entry lines. Validation enforces total debit = total credit.",
      rules: ["min 2 entries", "each line debit XOR credit", "non-negative", "server-computed totals", "FY must be open"],
    },
  });
});
