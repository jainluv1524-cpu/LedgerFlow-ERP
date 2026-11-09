import { getPrisma } from "../../lib/prisma.js";

const paginate = (limit?: number) => Math.min(Math.max(limit ?? 50, 1), 200);

export async function listCustomers(companyId: string) { return (await getPrisma()).customer.findMany({ where: { companyId }, orderBy: { name: "asc" }, take: paginate() }); }
export async function createCustomer(companyId: string, data: any) { return (await getPrisma()).customer.create({ data: { companyId, ...data } }); }
export async function listSuppliers(companyId: string) { return (await getPrisma()).supplier.findMany({ where: { companyId }, orderBy: { name: "asc" }, take: paginate() }); }
export async function createSupplier(companyId: string, data: any) { return (await getPrisma()).supplier.create({ data: { companyId, ...data } }); }
export async function listUnits(companyId: string) { return (await getPrisma()).unit.findMany({ where: { companyId }, orderBy: { name: "asc" } }); }
export async function createUnit(companyId: string, data: any) { return (await getPrisma()).unit.create({ data: { companyId, ...data } }); }
export async function listWarehouses(companyId: string) { return (await getPrisma()).warehouse.findMany({ where: { companyId }, orderBy: { name: "asc" } }); }
export async function createWarehouse(companyId: string, data: any) { return (await getPrisma()).warehouse.create({ data: { companyId, ...data } }); }
export async function listProducts(companyId: string) { return (await getPrisma()).product.findMany({ where: { companyId }, orderBy: { name: "asc" }, take: paginate() }); }
export async function createProduct(companyId: string, data: any) { return (await getPrisma()).product.create({ data: { companyId, ...data } }); }
