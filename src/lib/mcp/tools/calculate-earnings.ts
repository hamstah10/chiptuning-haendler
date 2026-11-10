import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { calcLaborCostPerJob, calcMonthlyEarnings } from "@/lib/format";

export default defineTool({
  name: "calculate_earnings",
  title: "Verdienst berechnen",
  description: "Calculate illustrative monthly earnings using the app's formula and caller-supplied amounts; no data is saved.",
  inputSchema: {
    jobs: z.number().int().min(1).max(60).describe("Jobs per month, 1 to 60."),
    customerPrice: z.number().min(199).max(1199).describe("Customer price per job in EUR."),
    filePrice: z.number().nonnegative().describe("File cost per job in EUR."),
    monthlyFee: z.number().nonnegative().describe("Monthly package cost in EUR."),
    minutes: z.number().min(5).max(480).describe("Working minutes per file."),
    hourlyRate: z.number().min(0).max(500).describe("Hourly rate in EUR."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (args) => {
    const labor = calcLaborCostPerJob(args.minutes, args.hourlyRate);
    const monthly = calcMonthlyEarnings(args.jobs, args.customerPrice, args.filePrice, args.monthlyFee, labor);
    return { content: [{ type: "text", text: `Illustrative earnings: ${monthly.toFixed(2)} EUR/month; ${(monthly * 12).toFixed(2)} EUR/year. Labour: ${labor.toFixed(2)} EUR/job. Not a revenue guarantee.` }] };
  },
});