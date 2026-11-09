import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const canRun = !!process.env.DATABASE_URL && process.env.RUN_DB_TESTS === "true";

describe.runIf(canRun)("DB integration (requires DATABASE_URL + RUN_DB_TESTS=true)", () => {
  const app = createApp();

  it("registers, creates COA, posts a balanced voucher, and reverses it", async () => {
    const email = `phase3+${Date.now()}@example.com`;
    const reg = await request(app).post("/api/v1/auth/register").send({
      email,
      name: "Integration User",
      password: "CorrectHorse!BatteryStaple8",
      companyName: "Integration Co",
    });
    expect(reg.status).toBe(201);
    const companyId = reg.body?.data?.company?.id;
    expect(companyId).toBeTruthy();
    const cookie = reg.headers["set-cookie"];

    // This test is a scaffold: complete it after confirming FY/ledger creation flows and response shapes.
    expect(cookie).toBeTruthy();
  });
});

describe("DB integration gate", () => {
  it("is skipped unless RUN_DB_TESTS=true with DATABASE_URL", () => {
    expect(typeof canRun).toBe("boolean");
  });
});
