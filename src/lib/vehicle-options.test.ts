import { describe, expect, it } from "vitest";
import { uniqueVehicleOptions } from "./vehicle-options";
import type { VehicleDetails, VehicleOption } from "./vehicle-api";

const option = (id: number, name: string, price: number | null = 199): VehicleOption => ({ id, name, price, active: true, category: null });
const details = (options: VehicleOption[], other: VehicleOption[] = []): VehicleDetails => ({
  engine: { id: 1, name: "Engine", horsepower: 105, torque: 175, fuel: "Benzin" }, stages: [], engineOptions: [],
  ecus: [{ id: 2, name: "ME7.5.20", manufacturer: null, options }, { id: 3, name: "Simos 10", manufacturer: null, options: other }],
});

describe("unique tuning option output", () => {
  it("shows matching names once even with different IDs, casing and whitespace", () => {
    const result = uniqueVehicleOptions(details([option(105902, "Getriebe"), option(105907, " GETRIEBE ")]));
    expect(result).toHaveLength(1);
    expect(result[0]?.assignments).toEqual([{ name: "ME7.5.20", prices: [199] }]);
  });
  it("combines duplicates across ECUs without losing assignments or different prices", () => {
    const result = uniqueVehicleOptions(details([option(1, "POPS & BANGS", 199), option(2, "POPS & BANGS", 249)], [option(3, "POPS & BANGS", null)]));
    expect(result).toHaveLength(1);
    expect(result[0]?.assignments).toEqual([{ name: "ME7.5.20", prices: [199, 249] }, { name: "Simos 10", prices: [null] }]);
  });
  it("retains distinct options and omits inactive ones", () => {
    const result = uniqueVehicleOptions(details([option(1, "V/MAX Off"), option(2, "START/STOP OFF"), { ...option(3, "Disabled"), active: false }]));
    expect(result.map((entry) => entry.name)).toEqual(["V/MAX Off", "START/STOP OFF"]);
  });
});