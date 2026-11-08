import { z } from "zod";

export const createAccountGroupSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().uuid().optional().nullable(),
  nature: z.enum(["ASSET", "LIABILITY", "INCOME", "EXPENSE", "EQUITY"]),
});

export const createLedgerSchema = z.object({
  name: z.string().min(1).max(200),
  groupId: z.string().uuid(),
  nature: z.enum(["ASSET", "LIABILITY", "INCOME", "EXPENSE", "EQUITY"]),
  code: z.string().max(50).optional().nullable(),
  openingBalance: z.union([z.number(), z.string()]).optional(),
  openingDrCr: z.enum(["DR", "CR"]).optional(),
});
