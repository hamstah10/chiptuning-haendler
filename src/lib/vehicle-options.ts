import type { VehicleDetails, VehicleOption } from "./vehicle-api";

export interface DisplayVehicleOption extends VehicleOption {
  key: string;
  assignments: Array<{ name: string; prices: Array<number | null> }>;
}

export function uniqueVehicleOptions(details: VehicleDetails): DisplayVehicleOption[] {
  const options = new Map<string, DisplayVehicleOption>();
  const sources = [
    { name: details.engine.name, options: details.engineOptions },
    ...details.ecus.map((ecu) => ({ name: [ecu.manufacturer, ecu.name].filter(Boolean).join(" "), options: ecu.options })),
  ];
  for (const source of sources) {
    for (const option of source.options) {
      if (!option.active) continue;
      const key = option.name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("de");
      const entry = options.get(key) ?? { ...option, name: option.name.trim(), key, assignments: [] };
      entry.icon ??= option.icon ?? null;
      entry.image ??= option.image ?? null;
      entry.category ??= option.category;
      const assignment = entry.assignments.find((item) => item.name === source.name);
      if (assignment) {
        if (!assignment.prices.includes(option.price)) assignment.prices.push(option.price);
      } else entry.assignments.push({ name: source.name, prices: [option.price] });
      options.set(key, entry);
    }
  }
  return [...options.values()];
}