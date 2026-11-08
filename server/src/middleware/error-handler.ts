import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    traceId: string;
  };
};

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, "NOT_FOUND", "Resource not found"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
): void {
  const traceId = randomUUID();

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details, traceId },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.flatten(),
        traceId,
      },
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(`[${traceId}] Unhandled error`, err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      traceId,
    },
  });
}
