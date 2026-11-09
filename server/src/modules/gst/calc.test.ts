import { describe, expect, it } from "vitest";
import { calculateGstDocument, calculateGstLine, determineGstTaxType } from "./calc.js";

describe("GST calculation (India)", () => {
  it("intra-state exclusive: splits CGST/SGST equally", () => {
    const r = calculateGstLine({ quantity: 1, unitPrice: 1000, taxRatePercent: 18, taxType: "INTRA", priceMode: "EXCLUSIVE" });
    expect(r.taxableValue).toBe(1000);
    expect(r.cgst).toBe(90);
    expect(r.sgst).toBe(90);
    expect(r.igst).toBe(0);
    expect(r.total).toBe(1180);
  });

  it("inter-state exclusive: uses IGST", () => {
    const r = calculateGstLine({ quantity: 2, unitPrice: 500, taxRatePercent: 18, taxType: "INTER", priceMode: "EXCLUSIVE" });
    expect(r.taxableValue).toBe(1000);
    expect(r.igst).toBe(180);
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(0);
    expect(r.total).toBe(1180);
  });

  it("intra-state inclusive: back-calculates taxable value", () => {
    const r = calculateGstLine({ quantity: 1, unitPrice: 1180, taxRatePercent: 18, taxType: "INTRA", priceMode: "INCLUSIVE" });
    expect(r.taxableValue).toBe(1000);
    expect(r.taxTotal).toBe(180);
    expect(r.cgst + r.sgst).toBe(180);
  });

  it("applies discount before tax (exclusive)", () => {
    const r = calculateGstLine({ quantity: 1, unitPrice: 1000, discountAmount: 100, taxRatePercent: 18, taxType: "INTRA", priceMode: "EXCLUSIVE" });
    expect(r.taxableValue).toBe(900);
    expect(r.taxTotal).toBe(162);
    expect(r.total).toBe(1062);
  });

  it("applies percent discount", () => {
    const r = calculateGstLine({ quantity: 1, unitPrice: 200, discountPercent: 10, taxRatePercent: 5, taxType: "INTER", priceMode: "EXCLUSIVE" });
    expect(r.discount).toBe(20);
    expect(r.taxableValue).toBe(180);
    expect(r.igst).toBe(9);
  });

  it("aggregates document totals across multiple lines/rates", () => {
    const doc = calculateGstDocument([
      { quantity: 1, unitPrice: 100, taxRatePercent: 5, taxType: "INTRA", priceMode: "EXCLUSIVE" },
      { quantity: 1, unitPrice: 200, taxRatePercent: 18, taxType: "INTRA", priceMode: "EXCLUSIVE" },
    ]);
    expect(doc.totals.taxableValue).toBe(300);
    expect(doc.totals.total).toBe(341); // 105 + 236
  });

  it("determines intra/inter state by state codes", () => {
    expect(determineGstTaxType("27", "27")).toBe("INTRA");
    expect(determineGstTaxType("27", "29")).toBe("INTER");
  });
});
