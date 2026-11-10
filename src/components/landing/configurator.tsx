import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatEuro, formatNumber } from "@/lib/format";
import { submitLead } from "@/lib/leads.functions";
import type { Content } from "@/lib/content";
import type { VehicleStage } from "@/lib/vehicle-api";
import { LiveVehicleSelection, type VehicleSelection } from "./live-vehicle-selection";

function Result({ c, selection }: { c: Content; selection: VehicleSelection }) {
  const t = c.configurator;
  const [stageId, setStageId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const details = selection.details;
  if (!details) return null;
  const stage: VehicleStage | undefined = details.stages.find((item) => item.id === stageId) ?? details.stages[0];
  const value = (number: number | null | undefined, unit: string) => number == null ? c.vehicleApi.noValue : `${formatNumber(number, c.locale)} ${unit}`;
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stage) return;
    setStatus("sending");
    try {
      await submitLead({ data: { source: "configurator", locale: c.locale, contactName: name, contact, details: {
        type: selection.labels[0] ?? "", brand: selection.labels[1] ?? "", series: selection.labels[2] ?? "", model: selection.labels[3] ?? "",
        engine: details.engine.name, engineId: String(details.engine.id), stage: stage.name, stageId: String(stage.id),
        total: stage.price == null ? c.vehicleApi.noValue : formatEuro(stage.price, c.locale),
      } } });
      setStatus("sent");
    } catch { setStatus("error"); }
  };
  return <div className="grid gap-6 border-t pt-6 lg:grid-cols-2">
    <div>
      <div className="text-sm text-muted-foreground">{selection.labels.slice(0, 4).join(" · ")}</div>
      <h3 className="mt-1 font-display text-2xl font-bold text-strong">{details.engine.name}</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {[[t.power, details.engine.horsepower, stage?.hp, "PS"], [t.torque, details.engine.torque, stage?.nm, "Nm"]].map(([label, stock, tuned, unit]) => <div key={String(label)} className="border-l-2 border-primary pl-4">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl font-bold text-primary">{value(typeof tuned === "number" ? tuned : null, String(unit))}</div>
          <div className="text-sm text-muted-foreground">{t.series}: {value(typeof stock === "number" ? stock : null, String(unit))}</div>
        </div>)}
      </div>
      {details.ecus.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{details.ecus.map((ecu) => <Badge variant="secondary" key={ecu.id}>{ecu.manufacturer} {ecu.name}</Badge>)}</div>}
    </div>
    <div>
      <div className="label-caps text-xs text-muted-foreground">{t.chooseStage}</div>
      <div className="mt-3 grid gap-2">{details.stages.map((item) => <Button key={item.id} variant={stage?.id === item.id ? "default" : "outline"} className="h-auto justify-between whitespace-normal p-3 text-left" onClick={() => setStageId(item.id)}><span>{item.name}</span><span className="font-mono">{item.price == null ? c.vehicleApi.noValue : formatEuro(item.price, c.locale)}</span></Button>)}</div>
      {!stage && <p className="mt-3 text-sm text-muted-foreground">{c.vehicleApi.noStages}</p>}
      {stage?.description && <p className="mt-3 text-sm text-muted-foreground">{stage.description}</p>}
      {stage && <>
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t pt-4"><span className="text-sm text-muted-foreground">{c.vehicleApi.price}</span><span className="font-display text-2xl font-bold text-strong">{stage.price == null ? c.vehicleApi.noValue : formatEuro(stage.price, c.locale)}</span></div>
        {status === "sent" ? <div role="status" className="mt-4 flex gap-2 text-sm text-strong"><CheckCircle2 className="size-5 shrink-0 text-primary" />{t.sent}</div> : <form onSubmit={onSubmit} className="mt-4 grid gap-2">
          <Input required minLength={2} maxLength={120} aria-label={t.name} placeholder={t.name} value={name} onChange={(e) => setName(e.target.value)} />
          <Input required minLength={5} maxLength={255} aria-label={t.contact} placeholder={t.contact} value={contact} onChange={(e) => setContact(e.target.value)} />
          <Button type="submit" disabled={status === "sending"}>{status === "sending" ? t.sending : t.submit}<ArrowRight /></Button>
          {status === "error" && <p role="alert" className="text-xs text-destructive">{t.error}</p>}
        </form>}
      </>}
    </div>
  </div>;
}

export function Configurator({ c }: { c: Content }) {
  return <div className="overflow-hidden rounded-md border border-border-strong border-t-2 border-t-primary bg-card shadow-2xl">
    <div className="flex flex-wrap items-center gap-2 border-b bg-sunken px-5 py-4"><SlidersHorizontal className="size-4 text-primary" /><span className="label-caps text-sm text-strong">{c.configurator.widgetTitle}</span><Badge variant="secondary">{c.vehicleApi.live}</Badge></div>
    <div className="p-5 md:p-7"><LiveVehicleSelection c={c}>{(selection) => <Result key={selection.details?.engine.id ?? "empty"} c={c} selection={selection} />}</LiveVehicleSelection><p className="mt-5 text-xs text-muted-foreground">{c.configurator.disclaimer}</p></div>
  </div>;
}
