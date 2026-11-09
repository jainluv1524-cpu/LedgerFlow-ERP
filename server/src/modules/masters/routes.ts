import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { HttpError } from "../../middleware/error-handler.js";
import { assertCompanyMember } from "../tenancy/membership.js";
import * as svc from "./service.js";
import { customerSchema, productSchema, supplierSchema, unitSchema, warehouseSchema } from "./schemas.js";

export const mastersRouter = Router({ mergeParams: true });
mastersRouter.use(requireAuth);

async function scoped(req: any) {
  const companyId = req.params.companyId;
  if (!companyId) throw new HttpError(400, "COMPANY_ID_REQUIRED", "companyId is required");
  await assertCompanyMember(req.auth.userId, companyId);
  return companyId;
}

mastersRouter.get("/customers", async (req, res, next) => { try { res.json({ data: await svc.listCustomers(await scoped(req)) }); } catch (e) { next(e); } });
mastersRouter.post("/customers", async (req, res, next) => { try { res.status(201).json({ data: await svc.createCustomer(await scoped(req), customerSchema.parse(req.body)) }); } catch (e) { next(e); } });
mastersRouter.get("/suppliers", async (req, res, next) => { try { res.json({ data: await svc.listSuppliers(await scoped(req)) }); } catch (e) { next(e); } });
mastersRouter.post("/suppliers", async (req, res, next) => { try { res.status(201).json({ data: await svc.createSupplier(await scoped(req), supplierSchema.parse(req.body)) }); } catch (e) { next(e); } });
mastersRouter.get("/units", async (req, res, next) => { try { res.json({ data: await svc.listUnits(await scoped(req)) }); } catch (e) { next(e); } });
mastersRouter.post("/units", async (req, res, next) => { try { res.status(201).json({ data: await svc.createUnit(await scoped(req), unitSchema.parse(req.body)) }); } catch (e) { next(e); } });
mastersRouter.get("/warehouses", async (req, res, next) => { try { res.json({ data: await svc.listWarehouses(await scoped(req)) }); } catch (e) { next(e); } });
mastersRouter.post("/warehouses", async (req, res, next) => { try { res.status(201).json({ data: await svc.createWarehouse(await scoped(req), warehouseSchema.parse(req.body)) }); } catch (e) { next(e); } });
mastersRouter.get("/products", async (req, res, next) => { try { res.json({ data: await svc.listProducts(await scoped(req)) }); } catch (e) { next(e); } });
mastersRouter.post("/products", async (req, res, next) => { try { res.status(201).json({ data: await svc.createProduct(await scoped(req), productSchema.parse(req.body)) }); } catch (e) { next(e); } });
