import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  gstin: z.string().max(20).optional().nullable(),
  address: z.record(z.any()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const supplierSchema = customerSchema;
export const unitSchema = z.object({ name: z.string().min(1).max(80), symbol: z.string().max(20).optional().nullable() });
export const warehouseSchema = z.object({ name: z.string().min(1).max(120), code: z.string().max(50).optional().nullable(), address: z.record(z.any()).optional().nullable(), isActive: z.boolean().optional() });
export const productSchema = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  hsnSac: z.string().max(20).optional().nullable(),
  itemType: z.enum(["GOODS", "SERVICE"]).optional(),
  salePrice: z.union([z.number(), z.string()]).optional(),
  purchasePrice: z.union([z.number(), z.string()]).optional(),
  taxRate: z.union([z.number(), z.string()]).optional(),
  isActive: z.boolean().optional(),
});
