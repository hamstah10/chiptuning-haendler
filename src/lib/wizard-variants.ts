import type { WizardQuestion } from "./partner-wizard-api";

export type WizardVariant = "imageCards" | "logoTiles" | "choiceCards" | "checkCards" | "segmented" | "chips" | "stepSlider" | "goalList";

/** Picks the input element that fits a wizard choice question based on the portal's question shape. */
export function pickVariant(q: Pick<WizardQuestion, "questionType" | "multiSelect" | "options" | "answerKey">): WizardVariant {
  if (q.answerKey === "experience") return "stepSlider";
  if (q.answerKey === "goal") return "goalList";
  if (q.questionType === "vehicleType") return "imageCards";
  if (q.questionType === "toolManufacturer") return "logoTiles";
  if (q.multiSelect) return q.options.some((o) => !!o.text) ? "checkCards" : "chips";
  const hasText = q.options.some((o) => !!o.text);
  if (!hasText && q.options.length <= 5) return "segmented";
  if (q.options.length <= 4) return "choiceCards";
  return "chips";
}
