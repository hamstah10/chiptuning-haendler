import { describe, expect, it } from "vitest";
import { VEHICLE_CONTEXT, vehicleDetailsSchema, vehiclePath, vehicleItemSchema, vehicleMediaUrl } from "./vehicle-api";

describe("DCT vehicle API", () => {
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