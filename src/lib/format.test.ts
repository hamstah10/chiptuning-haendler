import { describe, expect, it } from "vitest";
import { calcMonthlyEarnings, formatNumber } from "./format";

describe("formatNumber", () => {
  it("uses German separators (1.234,56)", () => {
    expect(formatNumber(1234.56, "de", 2)).toBe("1.234,56");
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
