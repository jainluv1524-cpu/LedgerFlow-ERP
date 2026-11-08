import { z } from "zod";

const voucherType = z.enum(["CONTRA", "PAYMENT", "RECEIPT", "JOURNAL", "SALES", "PURCHASE", "DEBIT_NOTE", "CREDIT_NOTE"]);

export const postVoucherSchema = z.object({
  financialYearId: z.string().uuid(),
  voucherType,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  narration: z.string().max(2000).optional(),
  reference: z.string().max(200).optional(),
  voucherNo: z.string().min(1).max(50).optional(), // if omitted, server assigns next number
  entries: z.array(z.object({
    ledgerId: z.string().uuid(),
    debit: z.union([z.number(), z.string()]),
    credit: z.union([z.number(), z.string()]),
    narration: z.string().max(1000).optional(),
  })).min(2),
});

export type PostVoucherInput = z.infer<typeof postVoucherSchema>;

export const reverseVoucherSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  narration: z.string().max(2000).optional(),
  reference: z.string().max(200).optional(),
});

export type ReverseVoucherInput = z.infer<typeof reverseVoucherSchema>;
