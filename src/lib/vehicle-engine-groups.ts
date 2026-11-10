import type { VehicleItem } from "./vehicle-api";

export type EngineFuel = "diesel" | "petrol" | "hybrid" | "electric" | "lpg" | "cng" | "hydrogen" | "unknown";
const fuelOrder: EngineFuel[] = ["diesel", "petrol", "hybrid", "electric", "lpg", "cng", "hydrogen", "unknown"];
const aliases: Record<string, EngineFuel> = {
  diesel: "diesel", benzin: "petrol", petrol: "petrol", gasoline: "petrol",
  hybrid: "hybrid", elektro: "electric", electric: "electric", elektrisch: "electric",
  lpg: "lpg", autogas: "lpg", cng: "cng", erdgas: "cng", wasserstoff: "hydrogen", hydrogen: "hydrogen",
};

export function groupVehicleEngines(items: VehicleItem[], locale: string) {
  const groups = new Map<string, { fuel: EngineFuel | null; items: VehicleItem[] }>();
  for (const item of items) {
    const raw = item.fuel?.trim() ?? "";
    const normalized = raw.toLocaleLowerCase("de");
    const fuel = normalized.includes("hybrid") ? "hybrid" : aliases[normalized] ?? (raw ? null : "unknown");
    const key = fuel ?? normalized;
    const group = groups.get(key) ?? { fuel, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  return [...groups.entries()]
    .sort(([keyA, a], [keyB, b]) => {
      const rank = (fuel: EngineFuel | null) => fuel === null ? fuelOrder.length - 1.5 : fuelOrder.indexOf(fuel);
      return rank(a.fuel) - rank(b.fuel) || collator.compare(keyA, keyB);
    })
    .map(([key, group]) => ({ key, fuel: group.fuel, label: group.items[0]?.fuel?.trim() ?? "", items: [...group.items].sort((a, b) => collator.compare(a.name, b.name)) }));
}