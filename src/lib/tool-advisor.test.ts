import { describe, expect, it } from "vitest";
import { recommendTool } from "./tool-advisor";

describe("recommendTool", () => {
  it("recommends master only for high budget with bench work", () => {
    expect(recommendTool({ focus: "car", method: "bench", budget: "high" })).toEqual({ mode: "master", tool: "masterFull" });
  });
  it("keeps high-budget OBD-only workshops on slave", () => {
    expect(recommendTool({ focus: "car", method: "obd", budget: "high" })).toEqual({ mode: "slave", tool: "obdSlave" });
  });
  it("recommends a bench slave tool for low budget bench work", () => {
    expect(recommendTool({ focus: "van", method: "bench", budget: "low" })).toEqual({ mode: "slave", tool: "benchSlave" });
  });
  it("uses the truck tool for trucks and agriculture", () => {
    expect(recommendTool({ focus: "truck", method: "obd", budget: "mid" }).tool).toBe("truck");
  });
});
