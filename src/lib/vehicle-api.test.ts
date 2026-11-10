import { describe, expect, it } from "vitest";
import { VEHICLE_CONTEXT, vehicleDetailsSchema, vehiclePath, vehicleItemSchema, vehicleMediaUrl } from "./vehicle-api";

describe("DCT vehicle API", () => {
  it("preserves real tuning options, ECU assignments and decimal prices", () => {
    const result = vehicleDetailsSchema.parse({ engine: { id: 1, name: "Engine", horsepower: 105, torque: 175, fuel: "Benzin" }, stages: [], engineOptions: [], ecus: [{ id: 7, name: "ME7.5.20", manufacturer: null, options: [{ id: 105881, name: "FEHLERCODES LÖSCHEN (Max5)", price: "149.00", icon: "/uploads/media/option.svg", active: true, category: { name: "Diagnose" } }, { id: 8, name: "Inactive", price: null, active: false }] }] });
    expect(result.ecus[0]?.options).toHaveLength(1);
    expect(result.ecus[0]?.options[0]?.price).toBe(149);
    expect(result.ecus[0]?.options[0]?.category?.name).toBe("Diagnose");
    expect(result.ecus[0]?.options[0]?.icon).toBe("https://portal.dct-files.de/uploads/media/option.svg");
  });
  it("preserves and resolves the API's vehicle icons and images", () => {
    const item = vehicleItemSchema.parse({ id: 1, name: "PKW", icon: "/uploads/vehicle-type/pkw.svg", image: "/uploads/vehicle-type/pkw.webp" });
    expect(item.icon).toBe("https://portal.dct-files.de/uploads/vehicle-type/pkw.svg");
    expect(item.image).toBe("https://portal.dct-files.de/uploads/vehicle-type/pkw.webp");
    expect(vehicleItemSchema.parse({ id: 2, name: "LKW" }).icon).toBeNull();
  });
  it("rejects unsafe or external media URLs", () => {
    expect(vehicleMediaUrl("javascript:alert(1)")).toBeNull();
    expect(vehicleMediaUrl("https://example.com/icon.svg")).toBeNull();
  });
  it("uses the requested dealer context", () => expect(VEHICLE_CONTEXT).toBe("haendler_werden"));
  it("allows only documented vehicle paths", () => {
    expect(vehiclePath({ kind: "engine-details", id: 123 })).toBe("/engine-details/123");
    expect(() => vehiclePath({ kind: "brands", id: -1 })).toThrow();
  });
  it("normalizes DCT decimal prices without inventing absent values", () => {
    const result = vehicleDetailsSchema.parse({ engine: { id: 1, name: "Engine", horsepower: 140, torque: 230, fuel: "Benzin" }, stages: [{ id: 2, name: "Stage 1", description: null, price: "590.00", hp: 195, nm: null, ecu: null }], ecus: [] });
    expect(result.stages[0]?.price).toBe(590);
    expect(result.stages[0]?.nm).toBeNull();
  });
});