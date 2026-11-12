import type { WizardQuestion } from "./partner-wizard-api";

export type WizardVariant = "imageCards" | "logoTiles" | "choiceCards" | "checkCards" | "segmented" | "chips";

/** Picks the input element that fits a wizard choice question based on the portal's question shape. */
export function pickVariant(q: Pick<WizardQuestion, "questionType" | "multiSelect" | "options">): WizardVariant {
  if (q.questionType === "vehicleType") return "imageCards";
  if (q.questionType === "toolManufacturer") return "logoTiles";
  if (q.multiSelect) return q.options.some((o) => !!o.text) ? "checkCards" : "chips";
  const hasText = q.options.some((o) => !!o.text);
  if (!hasText && q.options.length <= 5) return "segmented";
  if (q.options.length <= 4) return "choiceCards";
  return "chips";
}
