import type { Content } from "@/lib/content";
import type { VehicleDetails } from "@/lib/vehicle-api";
import { formatEuro } from "@/lib/format";
import { VehicleIcon } from "./vehicle-icon";

export function VehicleOptions({ details, c }: { details: VehicleDetails; c: Content }) {
  const groups = [
    { id: "engine", name: details.engine.name, options: details.engineOptions },
    ...details.ecus.map((ecu) => ({ id: `ecu-${ecu.id}`, name: [ecu.manufacturer, ecu.name].filter(Boolean).join(" "), options: ecu.options })),
  ].filter((group) => group.options.length > 0);
  if (groups.length === 0) return null;
  return <div className="grid gap-4 border-t pt-5">
    <h4 className="label-caps text-sm text-strong">{c.vehicleCheck.options}</h4>
    {groups.map((group) => <div key={group.id} className="grid min-w-0 gap-2">
      <div className="text-xs font-semibold text-muted-foreground">{group.name}</div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {group.options.map((option) => <li key={option.id} className="flex min-w-0 items-start gap-2 rounded-sm border bg-sunken p-3">
          <VehicleIcon item={option} />
          <div className="min-w-0 flex-1">
            <div className="break-words text-sm font-semibold text-strong">{option.name}</div>
            {option.category && <div className="text-xs text-muted-foreground">{option.category.name}</div>}
            <div className="mt-1 font-mono text-xs text-muted-foreground">{option.price == null ? c.vehicleApi.noValue : formatEuro(option.price, c.locale)}</div>
          </div>
        </li>)}
      </ul>
    </div>)}
  </div>;
}