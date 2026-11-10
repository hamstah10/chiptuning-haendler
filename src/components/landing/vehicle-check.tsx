import { Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatEuro, formatNumber } from "@/lib/format";
import type { Content } from "@/lib/content";
import { LiveVehicleSelection } from "./live-vehicle-selection";

export function VehicleCheck({ c }: { c: Content }) {
  const t = c.vehicleCheck;
  return <div className="rounded-md border bg-card p-5 md:p-8"><LiveVehicleSelection c={c}>{({ details, labels }) => {
    if (!details) return <div className="flex items-center justify-center gap-3 border-t py-8 text-muted-foreground"><Gauge className="size-6 text-primary" /><p className="text-sm">{t.empty}</p></div>;
    const stage = details.stages.find((item) => /stage\s*1/i.test(item.name)) ?? details.stages[0];
    return <div className="grid gap-4 border-t pt-5">
      <div className="flex flex-wrap items-center gap-2"><Badge>{stage?.name ?? c.vehicleApi.noStages}</Badge><span className="font-display font-semibold text-strong">{labels.slice(1).join(" · ")}</span></div>
      <div className="grid gap-4 sm:grid-cols-2">{[[t.power, details.engine.horsepower, stage?.hp, "PS"], [t.torque, details.engine.torque, stage?.nm, "Nm"]].map(([label, stock, tuned, unit]) => <div key={String(label)} className="border-l-2 border-primary pl-4"><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1 font-display text-2xl font-bold text-primary">{typeof tuned === "number" ? `${formatNumber(tuned, c.locale)} ${unit}` : c.vehicleApi.noValue}</div><span className="text-sm text-muted-foreground">{t.stock}: {typeof stock === "number" ? `${formatNumber(stock, c.locale)} ${unit}` : c.vehicleApi.noValue}</span></div>)}</div>
      {stage?.price != null && <p className="text-sm text-strong">{c.vehicleApi.price}: <span className="font-mono">{formatEuro(stage.price, c.locale)}</span></p>}
      <p className="text-xs text-muted-foreground">{t.disclaimer}</p>
    </div>;
  }}</LiveVehicleSelection></div>;
}
