import { describe, it, expect } from "vitest";
import { calcPackagePrice } from "./wizard-package-price";
const rec: any = {
  recommendedTools: [{ name: "Autotuner", product: { price: "2650", specialPrice: null } }],
  recommendedProducts: [
    { title: "WinOLS", sku: "W1", price: "1000", specialPrice: null },
    { title: "Gysflash", sku: "G1", price: "500", specialPrice: "400" },
  ],
};
describe("calcPackagePrice", () => {
  it("sums tool and products without discount", () => {
    expect(calcPackagePrice(rec, "Autotuner", ["WinOLS (W1)", "Gysflash (G1)"]).total).toBe(4050);
  });
  it("is zero with nothing selected", () => {
    expect(calcPackagePrice(rec, "", []).total).toBe(0);
  });
});
