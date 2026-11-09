import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { accountingRouter } from "./modules/accounting/routes.js";
import { authRouter } from "./modules/auth/routes.js";
import { mastersRouter } from "./modules/masters/routes.js";
import { reportsRouter } from "./modules/reports/routes.js";
import { healthRouter } from "./routes/health.js";
import { openApiHandler } from "./routes/openapi.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(attachUser);

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(healthRouter);

  app.get(`${env.API_BASE_PATH}`, (_req, res) => {
    res.json({
      data: {
        name: "LedgerFlow API",
        version: "v1",
        status: "foundation",
        modules: ["health", "auth", "openapi", "accounting", "masters", "reports"],
        docs: env.ENABLE_SWAGGER ? `${env.API_BASE_PATH}/openapi.json` : null,
      },
    });
  });

  if (env.ENABLE_SWAGGER) {
    app.get(`${env.API_BASE_PATH}/openapi.json`, openApiHandler);
  }
  app.use(`${env.API_BASE_PATH}/auth`, authRouter);
  app.use(`${env.API_BASE_PATH}/companies/:companyId`, accountingRouter);
  app.use(`${env.API_BASE_PATH}/companies/:companyId`, mastersRouter);
  app.use(`${env.API_BASE_PATH}/companies/:companyId/reports`, reportsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
