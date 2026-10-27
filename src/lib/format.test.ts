import { describe, expect, it } from "vitest";
import { calcLaborCostPerJob, calcMonthlyEarnings, formatDate, formatNumber } from "./format";

describe("formatNumber", () => {
  it("uses German separators (1.234,56)", () => {
    expect(formatNumber(1234.56, "de", 2)).toBe("1.234,56");
  });
});

describe("formatDate", () => {
  it("uses German date format (DD.MM.YYYY)", () => {
    expect(formatDate(new Date(2026, 9, 22), "de")).toBe("22.10.2026");
  });
});

describe("calcMonthlyEarnings", () => {
  it("subtracts file price per job and the monthly fee", () => {
    expect(calcMonthlyEarnings(10, 449, 32, 149)).toBe(4021);
  });

  it("never goes below zero", () => {
    expect(calcMonthlyEarnings(1, 30, 39, 0)).toBe(0);
  });

  it("subtracts the labour cost per job", () => {
    // 10 jobs à 449 €, file 32 €, 149 € fee, 60 min labour at 90 €/h = 90 € per job
    expect(calcMonthlyEarnings(10, 449, 32, 149, 90)).toBe(3121);
  });
});

describe("calcLaborCostPerJob", () => {
  it("converts minutes and hourly rate into a cost per job", () => {
    expect(calcLaborCostPerJob(60, 90)).toBe(90);
    expect(calcLaborCostPerJob(30, 90)).toBe(45);
  });

  it("treats negative input as zero", () => {
    expect(calcLaborCostPerJob(-10, 90)).toBe(0);
  });
});
