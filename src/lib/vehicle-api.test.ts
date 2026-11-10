import { describe, expect, it } from "vitest";
import { VEHICLE_CONTEXT, vehiclePath } from "./vehicle-api";

describe("DCT vehicle API", () => {
  it("uses the requested dealer context", () => expect(VEHICLE_CONTEXT).toBe("haendler_werden"));
  it("allows only documented vehicle paths", () => {
    expect(vehiclePath({ kind: "engine-details", id: 123 })).toBe("/engine-details/123");
    expect(() => vehiclePath({ kind: "brands", id: -1 })).toThrow();
  });
});