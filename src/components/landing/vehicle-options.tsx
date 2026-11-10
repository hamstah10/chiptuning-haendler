import type { Content } from "@/lib/content";
import type { VehicleDetails } from "@/lib/vehicle-api";
import { formatEuro } from "@/lib/format";
import { VehicleIcon } from "./vehicle-icon";
import { uniqueVehicleOptions } from "@/lib/vehicle-options";

export function VehicleOptions({ details, c }: { details: VehicleDetails; c: Content }) {
  const options = uniqueVehicleOptions(details);
  if (options.length === 0) return null;
  return <div className="grid gap-4 border-t pt-5">
    <h4 className="label-caps text-sm text-strong">{c.vehicleCheck.options}</h4>
      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => <li key={option.key} className="flex min-w-0 items-start gap-2 rounded-sm border bg-sunken p-3">
          <VehicleIcon item={option} />
          <div className="min-w-0 flex-1">
            <div className="break-words text-sm font-semibold text-strong">{option.name}</div>
            {option.category && <div className="text-xs text-muted-foreground">{option.category.name}</div>}
            {option.assignments.map((assignment) => <div key={assignment.name} className="mt-1 break-words text-xs text-muted-foreground">
              <span>{assignment.name}</span><span className="font-mono"> · {assignment.prices.map((price) => price == null ? c.vehicleApi.noValue : formatEuro(price, c.locale)).join(" / ")}</span>
            </div>)}
          </div>
        </li>)}
      </ul>
  </div>;
}