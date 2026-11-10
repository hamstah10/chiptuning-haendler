import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { content } from "@/lib/content";

export default defineTool({
  name: "dealer_information",
  title: "Händler-Pakete lesen",
  description: "Read the published dealer packages in German or English; does not access leads, notes or saved plans.",
  inputSchema: { locale: z.enum(["de", "en"]).default("de").describe("Language of the published package information.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ locale }) => ({ content: [{ type: "text", text: content[locale].packages.map(p => `${p.n}: File ${p.file} EUR; monthly ${p.monthly} EUR`).join("\n") }] }),
});