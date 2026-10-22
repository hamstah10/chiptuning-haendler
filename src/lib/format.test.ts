import { describe, expect, it } from "vitest";
import { calcMonthlyEarnings, formatDate, formatNumber } from "./format";

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
});
