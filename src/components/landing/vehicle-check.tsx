import { useState } from "react";
import { motion } from "motion/react";
import { Check, Gauge } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatEuro, formatNumber } from "@/lib/format";
import { VEHICLES } from "@/lib/vehicle-data";
import type { Content } from "@/lib/content";

type OptionKey = keyof Content["vehicleCheck"]["optionNames"];

function Field({ label, value, items, onChange, disabled, placeholder }: { label: string; value: string; items: string[]; onChange: (v: string) => void; disabled?: boolean; placeholder: string }) {
  return (
    <label className="grid gap-2">
      <span className="label-caps text-xs text-strong">{label}</span>
      <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((i) => (
            <SelectItem key={i} value={i}>
              {i}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function Readout({ label, stock, tuned, unit, c }: { label: string; stock: number; tuned: number; unit: string; c: Content }) {
  const t = c.vehicleCheck;
  return (
    <div className="rounded-sm border bg-background p-4">
      <span className="label-caps text-xs text-muted-foreground">{label}</span>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {t.stock} {formatNumber(stock, c.locale)} {unit}
        </span>
        <span className="font-display text-2xl font-bold text-primary">
          {formatNumber(tuned, c.locale)} {unit}
        </span>
      </div>
      <span className="mt-1 block text-sm font-semibold text-strong">
        +{formatNumber(tuned - stock, c.locale)} {unit}
      </span>
    </div>
  );
}

export function VehicleCheck({ c }: { c: Content }) {
  const t = c.vehicleCheck;
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [engineName, setEngineName] = useState("");
  const [price, setPrice] = useState(449);
  const models = brand ? Object.keys(VEHICLES[brand] ?? {}) : [];
  const engines = brand && model ? (VEHICLES[brand]?.[model] ?? []) : [];
  const engine = engines.find((e) => e.name === engineName);
  const filePrice = c.packages.find((p) => p.id === "pro")?.file ?? 0;

  return (
    <div className="grid gap-6 rounded-md border bg-card p-5 md:grid-cols-[1fr_1.3fr] md:p-8">
      <div className="grid content-start gap-4">
        <Field
          label={t.brand}
          value={brand}
          placeholder={t.choose}
          items={Object.keys(VEHICLES)}
          onChange={(v) => {
            setBrand(v);
            setModel("");
            setEngineName("");
          }}
        />
        <Field
          label={t.model}
          value={model}
          placeholder={t.choose}
          items={models}
          disabled={!brand}
          onChange={(v) => {
            setModel(v);
            setEngineName("");
          }}
        />
        <Field label={t.engine} value={engineName} placeholder={t.choose} items={engines.map((e) => e.name)} disabled={!model} onChange={setEngineName} />
      </div>

      {engine ? (
        <motion.div key={engine.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid content-start gap-4">
          <div className="flex items-center gap-2">
            <Badge>{t.stage1}</Badge>
            <span className="font-display font-semibold text-strong">
              {brand} {model} · {engine.name}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Readout label={t.power} stock={engine.ps} tuned={engine.tps} unit="PS" c={c} />
            <Readout label={t.torque} stock={engine.nm} tuned={engine.tnm} unit="Nm" c={c} />
          </div>
          <div>
            <span className="label-caps text-xs text-strong">{t.options}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {engine.options
                .filter((o) => (t.includedOptions as string[]).includes(o))
                .map((o) => (
                  <Badge key={o}>
                    <Check className="size-3" aria-hidden="true" />
                    {t.optionNames[o as OptionKey] ?? o}
                  </Badge>
                ))}
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">{t.includedLabel}</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {engine.options
                .filter((o) => !(t.includedOptions as string[]).includes(o))
                .map((o) => (
                  <Badge key={o} variant="outline">
                    {t.optionNames[o as OptionKey] ?? o}
                  </Badge>
                ))}
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">{t.extraLabel}</span>
          </div>
          <div className="rounded-sm border border-primary bg-background p-4">
            <div className="flex items-baseline justify-between">
              <span className="label-caps text-xs text-strong">{t.customerPrice}</span>
              <span className="font-display text-lg font-bold text-strong">{formatEuro(price, c.locale)}</span>
            </div>
            <Slider className="mt-3" min={199} max={999} step={10} value={[price]} onValueChange={(v) => setPrice(v[0] ?? 449)} aria-label={t.customerPrice} />
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t.margin}</span>
              <span className="font-display text-3xl font-bold text-primary">{formatEuro(Math.max(0, price - filePrice), c.locale)}</span>
            </div>
            <span className="mt-1 block text-xs text-muted-foreground">{t.marginNote}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.disclaimer}</p>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed p-8 text-center text-muted-foreground">
          <Gauge className="h-8 w-8 text-primary" aria-hidden="true" />
          <p className="text-sm">{t.empty}</p>
        </div>
      )}
    </div>
  );
}
