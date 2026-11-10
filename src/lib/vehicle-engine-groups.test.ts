import { describe, expect, it } from "vitest";
import { groupVehicleEngines } from "./vehicle-engine-groups";
import { vehicleItemSchema } from "./vehicle-api";

describe("engine fuel grouping", () => {
  it("preserves API fuel for motor grouping", () => {
    expect(vehicleItemSchema.parse({ id: 1, name: "2.0", fuel: "Diesel" }).fuel).toBe("Diesel");
  });
  it("groups diesel before petrol and sorts engines naturally inside groups", () => {
    const groups = groupVehicleEngines([
      { id: 1, name: "2.0", fuel: "Benzin" },
      { id: 2, name: "3.0", fuel: "Diesel" },
      { id: 3, name: "2.0", fuel: " diesel " },
      { id: 4, name: "1.0", fuel: "Petrol" },
    ], "de");
    expect(groups.map((group) => group.fuel)).toEqual(["diesel", "petrol"]);
    expect(groups.map((group) => group.items.map((item) => item.id))).toEqual([[3, 2], [4, 1]]);
  });
  it("keeps other fuel types and unclassified engines without guessing from names", () => {
    const groups = groupVehicleEngines([
      { id: 1, name: "TDI", fuel: null },
      { id: 2, name: "E", fuel: "Elektro" },
      { id: 3, name: "H", fuel: "Plug-in Hybrid" },
      { id: 4, name: "X", fuel: "Biofuel" },
    ], "de");
    expect(groups.map((group) => group.fuel)).toEqual(["hybrid", "electric", null, "unknown"]);
    expect(groups.flatMap((group) => group.items.map((item) => item.id))).toEqual([3, 2, 4, 1]);
  });
});