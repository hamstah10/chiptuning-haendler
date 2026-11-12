import { describe, expect, it } from "vitest";
import { sortToolBrands, toolBrandRank } from "./wizard-tool-order";

const opt = (title: string) => ({ title });

// Titles as the portal delivers them for client "tfd".
const api = ["CMD Flash", "Alientech", "Magic Motorsport", "Autotuner", "Dimsport"].map(opt);

describe("sortToolBrands", () => {
  it("orders brands autotuner, alientech, cmd, dimsport, magic", () => {
    expect(sortToolBrands(api, (o) => o.title).map((o) => o.title)).toEqual([
      "Autotuner",
      "Alientech",
      "CMD Flash",
      "Dimsport",
      "Magic Motorsport",
    ]);
  });

  it("keeps unknown brands at the end in the API order", () => {
    const withExtra = [...api, opt("Boring Tool"), opt("Another Tool")];
    const titles = sortToolBrands(withExtra, (o) => o.title).map((o) => o.title);
    expect(titles.slice(5)).toEqual(["Boring Tool", "Another Tool"]);
  });

  it("ranks a brand by keyword, not by exact title", () => {
    expect(toolBrandRank("CMD FLASH")).toBeLessThan(toolBrandRank("Dimsport"));
    expect(toolBrandRank("KESS3 Slave")).toBe(5);
  });
});
