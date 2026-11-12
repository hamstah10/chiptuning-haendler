import { describe, expect, it } from "vitest";
import { groupServiceOptions } from "./wizard-service-groups";

const opt = (value: string) => ({ value });
const services = ["stage1", "stage2", "eco", "adblue", "dpf", "agr", "vmax", "pops", "hardcut", "dsg", "diagnose", "coding"].map(opt);

describe("groupServiceOptions", () => {
  it("puts Stage 1, Stage 2 and Eco under performance tuning", () => {
    const groups = groupServiceOptions(services);
    expect(groups[0]?.id).toBe("performance");
    expect(groups[0]?.options.map((o) => o.value)).toEqual(["stage1", "stage2", "eco"]);
  });

  it("puts everything else under tuning options in the original order", () => {
    const groups = groupServiceOptions(services);
    expect(groups[1]?.id).toBe("options");
    expect(groups[1]?.options.map((o) => o.value)).toEqual(["adblue", "dpf", "agr", "vmax", "pops", "hardcut", "dsg", "diagnose", "coding"]);
  });

  it("returns no groups for questions without performance options", () => {
    expect(groupServiceOptions(["dq250", "zf8hp"].map(opt))).toEqual([]);
  });
});
