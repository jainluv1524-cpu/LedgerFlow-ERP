import { getPrisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error-handler.js";
import type { z } from "zod";
import type { createAccountGroupSchema, createLedgerSchema } from "./coa-schemas.js";

export async function listAccountGroups(companyId: string) {
  const prisma = await getPrisma();
  return prisma.accountGroup.findMany({ where: { companyId }, orderBy: { name: "asc" } });
}

export async function createAccountGroup(companyId: string, input: z.infer<typeof createAccountGroupSchema>) {
  const prisma = await getPrisma();
  if (input.parentId) {
    const parent = await prisma.accountGroup.findFirst({ where: { id: input.parentId, companyId } });
    if (!parent) throw new HttpError(400, "INVALID_PARENT_GROUP", "Parent group not found");
  }
  return prisma.accountGroup.create({ data: { companyId, name: input.name, parentId: input.parentId ?? null, nature: input.nature as any } });
}

export async function listLedgers(companyId: string) {
  const prisma = await getPrisma();
  return prisma.ledger.findMany({ where: { companyId }, include: { group: true }, orderBy: { name: "asc" } });
}

export async function createLedger(companyId: string, input: z.infer<typeof createLedgerSchema>) {
  const prisma = await getPrisma();
  const group = await prisma.accountGroup.findFirst({ where: { id: input.groupId, companyId } });
  if (!group) throw new HttpError(400, "INVALID_GROUP", "Account group not found");
  return prisma.ledger.create({
    data: {
      companyId,
      groupId: input.groupId,
      name: input.name,
      code: input.code ?? null,
      nature: input.nature as any,
      openingBalance: (input.openingBalance ?? 0) as any,
      openingDrCr: input.openingDrCr ?? "DR",
    },
  });
}
