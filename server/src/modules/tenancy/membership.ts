import { getPrisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/error-handler.js";

export async function assertCompanyMember(userId: string, companyId: string): Promise<void> {
  const prisma = await getPrisma();
  const member = await prisma.companyUser.findUnique({
    where: { companyId_userId: { companyId, userId } },
    select: { id: true },
  });
  if (!member) throw new HttpError(403, "FORBIDDEN_COMPANY", "You do not have access to this company");
}
