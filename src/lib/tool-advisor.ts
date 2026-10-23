export type Focus = "car" | "van" | "truck" | "bike";
export type Method = "obd" | "bench";
export type Budget = "low" | "mid" | "high";
export type ToolKey = "obdSlave" | "benchSlave" | "masterFull" | "truck" | "bike";

export interface AdvisorAnswers {
  focus: Focus;
  method: Method;
  budget: Budget;
}

export interface Recommendation {
  mode: "slave" | "master";
  tool: ToolKey;
}

/** Master only makes sense with a high budget and bench work; everyone else starts as slave. */
export function recommendTool({ focus, method, budget }: AdvisorAnswers): Recommendation {
  const mode = budget === "high" && method === "bench" ? "master" : "slave";
  if (focus === "truck") return { mode, tool: "truck" };
  if (focus === "bike") return { mode, tool: "bike" };
  if (mode === "master") return { mode, tool: "masterFull" };
  return { mode, tool: method === "bench" ? "benchSlave" : "obdSlave" };
}
