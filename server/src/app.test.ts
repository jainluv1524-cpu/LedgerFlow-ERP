import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("LedgerFlow API foundation", () => {
  const app = createApp();

  it("returns service health", async () => {
    const res = await request(app).get("/health");
    expect([200, 503]).toContain(res.status);
    expect(res.body.service).toBe("ledgerflow-api");
    expect(res.body.checks).toBeDefined();
  });

  it("returns v1 base payload", async () => {
    const res = await request(app).get("/api/v1");
    expect(res.status).toBe(200);
    expect(res.body.data?.name).toBe("LedgerFlow API");
  });

  it("returns structured 404", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error?.code).toBe("NOT_FOUND");
    expect(res.body.error?.traceId).toBeTruthy();
  });
});
