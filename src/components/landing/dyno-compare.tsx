import { useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { Content } from "@/lib/content";

const RPM_MIN = 1000;
const RPM_MAX = 4500;
const W = 640;
const H = 340;
const PAD_L = 48;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 30;

/** Illustrative stage multipliers applied to the stock engine values. */
const STAGE_MULT: Record<string, { ps: number; nm: number }> = {
  stock: { ps: 1, nm: 1 },
  s1: { ps: 1.27, nm: 1.18 },
  s2: { ps: 1.42, nm: 1.32 },
};

/** Torque shape over the rev band per fuel type: diesel peaks early and falls off hard, petrol holds a wide plateau. Tuned stages reach the plateau earlier and keep it longer. */
function torqueShape(x: number, fuel: string, tuned: boolean): number {
  const p =
    fuel === "diesel"
      ? tuned
        ? { rise: 0.14, hold: 0.58, drop: 0.38 }
        : { rise: 0.18, hold: 0.5, drop: 0.45 }
      : tuned
        ? { rise: 0.2, hold: 0.8, drop: 0.18 }
        : { rise: 0.26, hold: 0.72, drop: 0.22 };
  if (x < p.rise) return 0.55 + 0.45 * (x / p.rise);
  if (x <= p.hold) return 1;
  return 1 - p.drop * ((x - p.hold) / (1 - p.hold));
}

const SAMPLES = 60;

function buildPath(peakNm: number, fuel: string, tuned: boolean, mapX: (rpm: number) => number, mapY: (v: number) => number, value: (nm: number, rpm: number) => number): string {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const x = i / (SAMPLES - 1);
    const rpm = RPM_MIN + x * (RPM_MAX - RPM_MIN);
    const nm = peakNm * torqueShape(x, fuel, tuned);
    return `${i ? "L" : "M"}${mapX(rpm).toFixed(1)},${mapY(value(nm, rpm)).toFixed(1)}`;
  }).join(" ");
}

/** Raw PS curve maximum (before scaling to the stated stage peak). */
function psRawMax(peakNm: number, fuel: string, tuned: boolean): number {
  let max = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const x = i / (SAMPLES - 1);
    const rpm = RPM_MIN + x * (RPM_MAX - RPM_MIN);
    max = Math.max(max, (peakNm * torqueShape(x, fuel, tuned) * rpm) / 7023.5);
  }
  return max;
}

export function DynoCompare({ c }: { c: Content }) {
  const t = c.dynoCompare;
  const locale = c.locale;
  const [engineId, setEngineId] = useState(t.engines[0]?.id ?? "");
  const [enabled, setEnabled] = useState<string[]>(["stock", "s1"]);
  const [markerRpm, setMarkerRpm] = useState(3000);

  const engine = t.engines.find((e) => e.id === engineId) ?? t.engines[0] ?? { id: "", name: "", ps: 0, nm: 0 };

  const stages = useMemo(
    () =>
      t.stages.map((s) => {
        const mult = STAGE_MULT[s.id] ?? { ps: 1, nm: 1 };
        return {
          ...s,
          ps: Math.round((engine.ps * mult.ps) / 5) * 5,
          nm: Math.round((engine.nm * mult.nm) / 10) * 10,
        };
      }),
    [t.stages, engine],
  );

  const maxPs = Math.max(...stages.map((s) => s.ps)) * 1.15;
  const maxNm = Math.max(...stages.map((s) => s.nm)) * 1.15;
  const yMaxPs = Math.ceil(maxPs / 50) * 50;
  const yMaxNm = Math.ceil(maxNm / 100) * 100;

  const mapX = (rpm: number) => PAD_L + ((rpm - RPM_MIN) / (RPM_MAX - RPM_MIN)) * (W - PAD_L - PAD_R);
  const mapYPs = (v: number) => PAD_T + (1 - v / yMaxPs) * (H - PAD_T - PAD_B);
  const mapYNm = (v: number) => PAD_T + (1 - v / yMaxNm) * (H - PAD_T - PAD_B);

  const paths = useMemo(
    () =>
      stages.map((s) => ({
        id: s.id,
        ps: buildPath(s.nm, engine.fuel, s.id !== "stock", mapX, mapYPs, (nm, rpm) => ((nm * rpm) / 7023.5) * (s.ps / psRawMax(s.nm, engine.fuel, s.id !== "stock"))),
        nm: buildPath(s.nm, engine.fuel, s.id !== "stock", mapX, mapYNm, (nm) => nm),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stages, yMaxPs, yMaxNm, engine.fuel],
  );

  const toggle = (id: string) => setEnabled((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const valuesAt = (s: { id: string; ps: number; nm: number }, rpm: number) => {
    const x = (rpm - RPM_MIN) / (RPM_MAX - RPM_MIN);
    const tuned = s.id !== "stock";
    const nm = s.nm * torqueShape(x, engine.fuel, tuned);
    const ps = (nm * rpm) / 7023.5 * (s.ps / psRawMax(s.nm, engine.fuel, tuned) || 0);
    return { nm: Math.round(nm), ps: Math.round(ps) };
  };

  const stageStyle = (id: string) =>
    id === "stock" ? "stroke-faint" : id === "s1" ? "stroke-primary" : "stroke-strong";

  const rpmTicks = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500];
  const psTicks = Array.from({ length: 5 }, (_, i) => Math.round((yMaxPs / 4) * i));

  return (
    <div className="overflow-hidden rounded-md border border-border-strong border-t-2 border-t-primary bg-card shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-sunken px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Gauge className="size-4 text-primary" />
          <span className="label-caps text-[13px] text-strong">{t.widgetTitle}</span>
          <Badge variant="secondary" className="rounded-sm">{t.demoBadge}</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {t.engines.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEngineId(e.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                e.id === engineId ? "border-primary bg-primary text-primary-foreground" : "text-faint hover:border-primary hover:text-strong",
              )}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="relative overflow-hidden rounded-sm border bg-sunken">
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={t.chartLabel}>
              {psTicks.map((v) => (
                <g key={v}>
                  <line x1={PAD_L} y1={mapYPs(v)} x2={W - PAD_R} y2={mapYPs(v)} className="stroke-border" strokeWidth="1" />
                  <text x={PAD_L - 6} y={mapYPs(v) + 3} textAnchor="end" className="fill-faint" fontSize="10" fontFamily="monospace">
                    {v}
                  </text>
                </g>
              ))}
              {rpmTicks.map((rpm) => (
                <g key={rpm}>
                  <line x1={mapX(rpm)} y1={PAD_T} x2={mapX(rpm)} y2={H - PAD_B} className="stroke-border" strokeWidth="0.5" strokeDasharray="2 3" />
                  <text x={mapX(rpm)} y={H - PAD_B + 16} textAnchor="middle" className="fill-faint" fontSize="10" fontFamily="monospace">
                    {formatNumber(rpm, locale)}
                  </text>
                </g>
              ))}
              {paths
                .filter((p) => enabled.includes(p.id))
                .map((p) => (
                  <g key={p.id}>
                    <path d={p.nm} fill="none" className={stageStyle(p.id)} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.85" />
                    <path d={p.ps} fill="none" className={stageStyle(p.id)} strokeWidth="2.5" />
                  </g>
                ))}
              <line x1={mapX(markerRpm)} y1={PAD_T} x2={mapX(markerRpm)} y2={H - PAD_B} className="stroke-strong" strokeWidth="1" />
              <circle cx={mapX(markerRpm)} cy={PAD_T} r="3" className="fill-strong" />
            </svg>
            <div className="pointer-events-none absolute bottom-8 right-3 font-mono text-[10px] uppercase tracking-wider text-faint">{t.axisRpm}</div>
            <div className="pointer-events-none absolute right-3 top-2 font-mono text-[10px] uppercase tracking-wider text-faint">{t.unitPs}</div>
          </div>

          <div className="mt-4">
            <label htmlFor="dyno-rpm" className="font-mono text-xs uppercase tracking-wider text-faint">
              {t.sliderLabel}: {formatNumber(markerRpm, locale)} 1/min
            </label>
            <input
              id="dyno-rpm"
              type="range"
              min={RPM_MIN}
              max={RPM_MAX}
              step={50}
              value={markerRpm}
              onChange={(e) => setMarkerRpm(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-faint">{t.show}</div>
          <div className="mt-2.5 grid gap-2">
            {stages.map((s) => {
              const on = enabled.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "block w-full rounded-sm border px-3.5 py-3 text-left transition-colors",
                    on ? "border-primary bg-primary-soft" : "bg-card hover:border-border-strong",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold uppercase text-strong">{s.label}</span>
                    <span className={cn("font-mono text-xs", on ? "text-primary" : "text-faint")}>
                      {formatNumber(s.ps, locale)} PS · {formatNumber(s.nm, locale)} Nm
                    </span>
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{s.note}</span>
                  {s.options.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {s.options.map((o) => (
                        <span key={o} className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">
                          {o}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-sm border bg-sunken px-4 py-3.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-faint">
              {t.readout} · {formatNumber(markerRpm, locale)} 1/min
            </div>
            <div className="mt-2 grid gap-1.5">
              {stages
                .filter((s) => enabled.includes(s.id))
                .map((s) => {
                  const v = valuesAt(s, markerRpm);
                  return (
                    <div key={s.id} className="flex items-baseline justify-between gap-2 text-sm">
                      <span className={cn("font-display font-bold uppercase", s.id === "s1" ? "text-primary" : "text-strong")}>{s.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatNumber(v.ps, locale)} PS · {formatNumber(v.nm, locale)} Nm
                      </span>
                    </div>
                  );
                })}
              {enabled.length === 0 && <p className="text-xs text-faint">{t.noneSelected}</p>}
            </div>
          </div>

          <div className="mt-4 grid gap-1.5 font-mono text-[11px] uppercase tracking-wider text-faint">
            <span className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 bg-strong" /> {t.legendPs}
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-strong" /> {t.legendNm}
            </span>
          </div>
        </div>
      </div>

      <p className="border-t px-5 py-3 text-[11.5px] leading-normal text-faint md:px-7">{t.disclaimer}</p>
    </div>
  );
}
