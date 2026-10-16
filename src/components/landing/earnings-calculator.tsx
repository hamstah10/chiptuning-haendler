import { useState } from "react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { calcMonthlyEarnings, formatEuro, formatNumber } from "@/lib/format";
import type { Content } from "@/lib/content";

export function EarningsCalculator({ c }: { c: Content }) {
  const t = c.calculator;
  const [jobs, setJobs] = useState(10);
  const [price, setPrice] = useState(449);
  const [pkgId, setPkgId] = useState("pro");
  const pkg = c.packages.find((p) => p.id === pkgId) ?? { file: 0, monthly: 0 };
  const monthly = calcMonthlyEarnings(jobs, price, pkg.file, pkg.monthly);

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
