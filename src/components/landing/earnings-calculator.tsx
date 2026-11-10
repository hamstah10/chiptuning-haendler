import { useState } from "react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { calcLaborCostPerJob, calcMonthlyEarnings, formatEuro, formatNumber } from "@/lib/format";
import type { Content } from "@/lib/content";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";

function FixedField({ label, unit, value, min, max, onChange }: { label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-2">
      <span className="label-caps text-xs text-strong">{label}</span>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : min);
          }}
          aria-label={label}
          className="w-28"
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </label>
  );
}

export function EarningsCalculator({ c }: { c: Content }) {
  const t = c.calculator;
  const [jobs, setJobs] = useState(10);
  const [price, setPrice] = useState(449);
  const [minutes, setMinutes] = useState(60);
  const [rate, setRate] = useState(90);
  const [pkgId, setPkgId] = useState("pro");
  const pkg = c.packages.find((p) => p.id === pkgId) ?? { file: 0, monthly: 0 };
  const labor = calcLaborCostPerJob(minutes, rate);
  const monthly = calcMonthlyEarnings(jobs, price, pkg.file, pkg.monthly, labor);
  useWebMCP({
    name: "read_current_earnings",
    description: "Read the current earnings calculator inputs and result without changing them.",
    annotations: { readOnlyHint: true },
    execute: () => runWebMCPTool("read_current_earnings", () => `${jobs} jobs/month; customer price ${formatEuro(price, c.locale)}; ${minutes} minutes/file; hourly rate ${formatEuro(rate, c.locale)}; file cost ${formatEuro(pkg.file, c.locale)}; monthly fee ${formatEuro(pkg.monthly, c.locale)}; illustrative monthly earnings ${formatEuro(monthly, c.locale)}.`),
  });

  return (
    <div className="grid gap-6 rounded-md border bg-card p-5 md:grid-cols-[1.2fr_1fr] md:p-8">
      <div className="grid gap-7">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-caps text-xs text-strong">{t.jobs}</span>
            <span className="font-display text-2xl font-bold text-strong">{formatNumber(jobs, c.locale)}</span>
          </div>
          <Slider className="mt-3" min={1} max={60} step={1} value={[jobs]} onValueChange={(v) => setJobs(v[0] ?? 1)} aria-label={t.jobs} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-caps text-xs text-strong">{t.price}</span>
            <span className="font-display text-2xl font-bold text-strong">{formatEuro(price, c.locale)}</span>
          </div>
          <Slider className="mt-3" min={199} max={1199} step={10} value={[price]} onValueChange={(v) => setPrice(v[0] ?? 199)} aria-label={t.price} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FixedField label={t.workTime} unit={t.workTimeUnit} value={minutes} min={5} max={480} onChange={setMinutes} />
          <FixedField label={t.hourlyRate} unit={t.hourlyRateUnit} value={rate} min={0} max={500} onChange={setRate} />
        </div>
        <div className="flex items-baseline justify-between rounded-sm border bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">{t.labor}</span>
          <span className="font-display text-lg font-bold text-strong">{formatEuro(labor, c.locale)}</span>
        </div>
        <div>
          <span className="label-caps text-xs text-strong">{t.pkg}</span>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {c.packages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPkgId(p.id)}
                className={cn("rounded-sm border px-3 py-2.5 text-left transition-colors", p.id === pkgId ? "border-primary bg-primary-soft" : "hover:border-border-strong")}
              >
                <span className="block font-display text-sm font-bold uppercase text-strong">{p.n}</span>
                <span className="block font-mono text-[11px] text-faint">
                  {formatEuro(p.file, c.locale)} {t.perFile}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-sm border border-t-2 border-t-primary bg-sunken p-6">
        <span className="kicker">{t.result}</span>
        <motion.span key={monthly} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-5xl font-bold text-strong">
          {formatEuro(monthly, c.locale)}
        </motion.span>
        <span className="mt-4 text-sm text-muted-foreground">
          {t.year}: <strong className="text-strong">{formatEuro(monthly * 12, c.locale)}</strong>
        </span>
        <p className="mt-5 text-xs leading-relaxed text-faint">{t.note}</p>
      </div>
    </div>
  );
}
