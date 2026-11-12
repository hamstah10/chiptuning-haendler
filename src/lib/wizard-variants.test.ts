import { describe, expect, it } from "vitest";
import { pickVariant } from "./wizard-variants";

const opt = (text: string | null) => ({ value: "x", id: 1, title: "x", text, icon: null, imageUrl: null });
const q = (questionType: "generic" | "vehicleType" | "toolManufacturer", multiSelect: boolean, options: ReturnType<typeof opt>[]) => ({ questionType, multiSelect, options });

describe("pickVariant", () => {
  it("vehicle types become image cards", () => expect(pickVariant(q("vehicleType", true, [opt(null)]))).toBe("imageCards"));
  it("tool manufacturers become logo tiles", () => expect(pickVariant(q("toolManufacturer", false, [opt("a")]))).toBe("logoTiles"));
  it("multi-select questions without text become chips", () => expect(pickVariant(q("generic", true, Array(12).fill(opt(null))))).toBe("chips"));
  it("multi-select questions with descriptions become check cards", () => expect(pickVariant(q("generic", true, Array(12).fill(opt("a"))))).toBe("checkCards"));
  it("up to 4 described single answers become choice cards", () => expect(pickVariant(q("generic", false, Array(4).fill(opt("a"))))).toBe("choiceCards"));
  it("short single answers without text become a segmented bar", () => expect(pickVariant(q("generic", false, Array(3).fill(opt(null))))).toBe("segmented"));
});
