export type GstPriceMode = "EXCLUSIVE" | "INCLUSIVE";
export type GstTaxType = "INTRA" | "INTER"; // INTRA => CGST+SGST (or UTGST as configured); INTER => IGST

export type GstLineInput = {
  quantity: number;
  unitPrice: number; // price per unit in the given mode context
  discountAmount?: number; // absolute discount on line (before tax), default 0
  discountPercent?: number; // 0-100, applied to gross if discountAmount not set
  taxRatePercent: number; // e.g. 18 for 18%
  taxType: GstTaxType;
  priceMode: GstPriceMode;
  cessRatePercent?: number; // optional
};

export type GstLineResult = {
  gross: number;
  discount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxTotal: number;
  total: number; // payable for exclusive = taxable+tax; for inclusive = gross-discount (informational)
};

function r2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateGstLine(input: GstLineInput): GstLineResult {
  const q = input.quantity;
  const gross = r2(q * input.unitPrice);
  let discount = 0;
  if (typeof input.discountAmount === "number") discount = r2(input.discountAmount);
  else if (typeof input.discountPercent === "number") discount = r2(gross * (input.discountPercent / 100));
  discount = Math.min(Math.max(discount, 0), gross);
  const base = r2(gross - discount);
  const rate = input.taxRatePercent / 100;
  const cessRate = (input.cessRatePercent ?? 0) / 100;

  let taxableValue: number;
  let taxBeforeSplit: number;
  let cess: number;
  if (input.priceMode === "INCLUSIVE" && rate > 0) {
    // base includes tax: taxable = base / (1 + rate + cessRate)
    taxableValue = r2(base / (1 + rate + cessRate));
    cess = r2(taxableValue * cessRate);
    taxBeforeSplit = r2(base - taxableValue - cess);
  } else {
    taxableValue = base;
    taxBeforeSplit = r2(taxableValue * rate);
    cess = r2(taxableValue * cessRate);
  }

  let cgst = 0, sgst = 0, igst = 0;
  if (input.taxType === "INTER") {
    igst = taxBeforeSplit;
  } else {
    cgst = r2(taxBeforeSplit / 2);
    sgst = r2(taxBeforeSplit - cgst); // avoid penny loss
  }

  const taxTotal = r2(cgst + sgst + igst + cess);
  const total = input.priceMode === "INCLUSIVE" ? base : r2(taxableValue + taxTotal);
  return { gross, discount, taxableValue, cgst, sgst, igst, cess, taxTotal, total };
}

export function calculateGstDocument(lines: GstLineInput[]) {
  const results = lines.map(calculateGstLine);
  const sum = (k: keyof GstLineResult) => r2(results.reduce((a, r) => a + (r[k] as number), 0));
  return {
    lines: results,
    totals: {
      gross: sum("gross"), discount: sum("discount"), taxableValue: sum("taxableValue"),
      cgst: sum("cgst"), sgst: sum("sgst"), igst: sum("igst"), cess: sum("cess"),
      taxTotal: sum("taxTotal"), total: sum("total"),
    },
  };
}

export function determineGstTaxType(supplierStateCode: string, placeOfSupplyStateCode: string): GstTaxType {
  return supplierStateCode.trim() === placeOfSupplyStateCode.trim() ? "INTRA" : "INTER";
}
