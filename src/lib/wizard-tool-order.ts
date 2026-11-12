/**
 * Tool brands shown first in the wizard's "do you already have a tool?" question.
 * Everything the portal lists but is not named here keeps its API order at the end.
 */
export const TOOL_BRAND_ORDER = ["autotuner", "alientech", "cmd", "dimsport", "magic"];

/** Rank of a brand title; unknown brands sort after the named ones. */
export function toolBrandRank(title: string): number {
  const t = title.trim().toLowerCase();
  const i = TOOL_BRAND_ORDER.findIndex((k) => t.includes(k));
  return i === -1 ? TOOL_BRAND_ORDER.length : i;
}

/** Stable sort: named brands in TOOL_BRAND_ORDER, the rest in the order the API delivered. */
export function sortToolBrands<T>(options: T[], title: (o: T) => string): T[] {
  return options
    .map((o, i) => ({ o, i, r: toolBrandRank(title(o)) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.o);
}
