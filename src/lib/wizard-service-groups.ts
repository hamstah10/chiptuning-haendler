/**
 * Splits the wizard's service list into the two families the portal offers:
 * performance tuning (Stage 1, Stage 2, Eco) and all other tuning options.
 * Returns an empty list when the question is not a service list, so other
 * multi-select questions keep their normal rendering.
 */
export type WizardServiceGroupId = "performance" | "options";

const PERFORMANCE = /^(stage\s*\d*|eco\w*)$/i;

const key = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

export function groupServiceOptions<T extends { value: string }>(options: T[]): { id: WizardServiceGroupId; options: T[] }[] {
  const isPerformance = (o: T) => PERFORMANCE.test(key(o.value));
  const performance = options.filter(isPerformance);
  if (performance.length === 0) return [];
  const groups: { id: WizardServiceGroupId; options: T[] }[] = [
    { id: "performance", options: performance },
    { id: "options", options: options.filter((o) => !isPerformance(o)) },
  ];
  return groups.filter((g) => g.options.length > 0);
}
