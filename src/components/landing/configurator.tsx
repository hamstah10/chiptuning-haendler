import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Car, CarFront, Check, CheckCircle2, Fuel, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatEuro, formatNumber } from "@/lib/format";
import { submitLead } from "@/lib/leads.functions";
import type { Content } from "@/lib/content";

const BRANDS = ["Audi", "BMW", "Mercedes-Benz", "VW", "Škoda", "Seat", "Ford", "Opel", "Porsche", "Volvo", "Renault", "Fiat"];

const MODELS: Record<string, string[]> = {
  Audi: ["A3 8Y (2020 – heute)", "A4 B9 (2015 – 2023)", "A6 C8 (2018 – heute)", "Q5 FY (2017 – heute)", "RS3 8Y (2021 – heute)"],
  BMW: ["1er F40 (2019 – heute)", "3er G20 (2018 – heute)", "5er G30 (2017 – 2023)", "X3 G01 (2017 – heute)"],
  "Mercedes-Benz": ["A-Klasse W177", "C-Klasse W206", "E-Klasse W213", "Sprinter 907"],
  VW: ["Golf 8 (2019 – heute)", "Passat B8", "Tiguan AD1", "T6.1 Transporter"],
};

interface Engine {
  n: string;
  ps: number;
  nm: number;
  tps: number;
  tnm: number;
  fuel: "diesel" | "petrol";
}

const ENGINES: Engine[] = [
  { n: "2.0 TDI", ps: 150, nm: 340, tps: 190, tnm: 400, fuel: "diesel" },
  { n: "2.0 TFSI", ps: 190, nm: 320, tps: 245, tnm: 400, fuel: "petrol" },
  { n: "35 TDI", ps: 163, nm: 380, tps: 205, tnm: 440, fuel: "diesel" },
  { n: "45 TFSI quattro", ps: 245, nm: 370, tps: 300, tnm: 450, fuel: "petrol" },
];

function DynoChart({ base, tuned, labels }: { base: number; tuned: number; labels: [string, string] }) {
  const pts = 40;
  const curve = (peak: number) =>
    Array.from({ length: pts }, (_, i) => {
      const x = i / (pts - 1);
      const y = Math.pow(Math.sin(Math.PI * Math.pow(x, 0.78)), 0.9);
      return peak * (0.12 + 0.88 * y);
    });
  const max = tuned * 1.12;
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i ? "L" : "M"}${(i / (pts - 1)) * 100},${100 - (v / max) * 100}`).join(" ");

  return (
    <div className="relative h-48 overflow-hidden rounded-sm border bg-sunken">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} className="stroke-border" strokeWidth="0.3" />
        ))}
        <path d={path(curve(base))} fill="none" className="stroke-faint" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <motion.path
          key={tuned}
          d={path(curve(tuned))}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute left-3 top-2.5 grid gap-1 font-mono text-[10.5px] uppercase tracking-wider text-faint">
        <span>{labels[0]}</span>
        <span className="text-primary">{labels[1]}</span>
      </div>
    </div>
  );
}

export function Configurator({ c }: { c: Content }) {
  const t = c.configurator;
  const locale = c.locale;
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [stage, setStage] = useState(t.stages[0]);
  const [opts, setOpts] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const models = brand ? (MODELS[brand] ?? t.otherModels) : [];
  const gainPs = engine ? Math.round((engine.tps - engine.ps) * stage.mult) : 0;
  const gainNm = engine ? Math.round((engine.tnm - engine.nm) * stage.mult) : 0;
  const total = stage.price + opts.reduce((s, o) => s + (t.optionList.find((x) => x.id === o)?.p ?? 0), 0);

  const jump = (i: number) => {
    if (i > step) return;
    setStep(i);
    if (i < 1) setBrand(null);
    if (i < 2) setModel(null);
    if (i < 3) setEngine(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!engine || !brand || !model) return;
    setStatus("sending");
    try {
      await submitLead({
        data: {
          source: "configurator",
          locale,
          contactName: name,
          contact,
          details: {
            brand,
            model,
            engine: engine.n,
            stage: stage.n,
            options: opts.join(", "),
            total: formatEuro(total, locale),
          },
        },
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const heading = "font-display text-lg font-bold uppercase text-strong";

  return (
    <div className="overflow-hidden rounded-md border border-border-strong border-t-2 border-t-primary bg-card shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-sunken px-5 py-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <span className="label-caps text-[13px] text-strong">{t.widgetTitle}</span>
          <Badge variant="secondary" className="rounded-sm">{t.demo}</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {t.stepLabels.map((l, i) => (
            <button
              key={l}
              type="button"
              onClick={() => jump(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                i === step && "border-primary bg-primary text-primary-foreground",
                i < step && "cursor-pointer text-strong hover:border-primary",
                i > step && "cursor-default text-faint",
              )}
            >
              {i < step && <Check className="size-3" />}
              {l}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="p-5 md:p-7">
        {step === 0 && (
          <>
            <div className={heading}>{t.brandTitle}</div>
            <p className="mb-5 mt-1.5 text-sm text-muted-foreground">{t.brandText}</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setBrand(b);
                    setStep(1);
                  }}
                  className="flex items-center gap-2.5 rounded-sm border bg-card p-3.5 text-left font-display text-sm font-bold text-strong transition-all hover:-translate-y-0.5 hover:border-primary"
                >
                  <Car className="size-4 shrink-0 text-primary" />
                  {b}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className={heading}>
              {brand} – {t.modelTitle}
            </div>
            <p className="mb-5 mt-1.5 text-sm text-muted-foreground">{t.modelText}</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {models.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setModel(m);
                    setStep(2);
                  }}
                  className="flex items-center gap-2.5 rounded-sm border bg-card p-3.5 text-left font-display text-sm font-bold text-strong transition-all hover:-translate-y-0.5 hover:border-primary"
                >
                  <CarFront className="size-4 shrink-0 text-primary" />
                  {m}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={heading}>{t.engineTitle}</div>
            <p className="mb-5 mt-1.5 text-sm text-muted-foreground">{model}</p>
            <div className="grid gap-2">
              {ENGINES.map((e) => (
                <button
                  key={e.n}
                  type="button"
                  onClick={() => {
                    setEngine(e);
                    setStep(3);
                  }}
                  className="flex items-center justify-between gap-3 rounded-sm border bg-card px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary"
                >
                  <span className="flex items-center gap-3">
                    <Fuel className="size-4 text-primary" />
                    <span>
                      <span className="block font-display font-bold text-strong">{e.n}</span>
                      <span className="block text-xs text-faint">
                        {t.fuel[e.fuel]} · {t.series} {e.ps} PS / {e.nm} Nm
                      </span>
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-xs text-primary">
                    + {e.tps - e.ps} PS
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && engine && (
          <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-faint">
                {brand} · {model}
              </div>
              <div className="mt-1 font-display text-2xl font-bold uppercase text-strong">{engine.n}</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(
                  [
                    [t.power, engine.ps, engine.ps + gainPs, "PS"],
                    [t.torque, engine.nm, engine.nm + gainNm, "Nm"],
                  ] as const
                ).map(([l, a, b, u]) => (
                  <div key={l} className="rounded-sm border bg-sunken px-4 py-3.5">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-faint">{l}</div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold text-strong">{formatNumber(b, locale)}</span>
                      <span className="text-xs text-faint">{u}</span>
                      <span className="ml-auto font-mono text-xs text-primary">+{b - a}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <DynoChart
                  base={engine.ps}
                  tuned={engine.ps + gainPs}
                  labels={[`${t.series} ${engine.ps} PS`, `${t.tuned} ${engine.ps + gainPs} PS`]}
                />
              </div>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-faint">{t.chooseStage}</div>
              <div className="mt-2.5 grid gap-2">
                {t.stages.map((s) => {
                  const on = s.id === stage.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s)}
                      className={cn(
                        "block w-full rounded-sm border px-3.5 py-3 text-left transition-colors",
                        on ? "border-primary bg-primary-soft" : "bg-card hover:border-border-strong",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold uppercase text-strong">{s.n}</span>
                        <span className={cn("font-mono text-xs", on ? "text-primary" : "text-faint")}>{formatEuro(s.price, locale)}</span>
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{s.d}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 font-mono text-xs uppercase tracking-wider text-faint">{t.options}</div>
              <div className="mt-2.5 grid gap-1.5">
                {t.optionList.map((o) => {
                  const on = opts.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOpts(on ? opts.filter((x) => x !== o.id) : [...opts, o.id])}
                      className={cn("flex items-center gap-2.5 rounded-sm border px-3 py-2.5 text-left", on && "border-primary")}
                    >
                      <span className={cn("inline-flex size-4 items-center justify-center rounded-[4px] border", on && "border-primary bg-primary")}>
                        {on && <Check className="size-3 text-primary-foreground" />}
                      </span>
                      <span className="flex-1 text-sm text-strong">{o.n}</span>
                      <span className="font-mono text-xs text-faint">+{formatEuro(o.p, locale)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-baseline justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">{t.total}</span>
                <span className="font-display text-3xl font-bold text-strong">{formatEuro(total, locale)}</span>
              </div>

              {status === "sent" ? (
                <div className="mt-3.5 flex items-start gap-2.5 rounded-sm border border-primary bg-primary-soft px-4 py-3.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-strong">{t.sent}</span>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-3.5 grid gap-2">
                  <Input required minLength={2} maxLength={120} placeholder={t.name} value={name} onChange={(e) => setName(e.target.value)} className="rounded-sm bg-sunken" aria-label={t.name} />
                  <Input required minLength={5} maxLength={255} placeholder={t.contact} value={contact} onChange={(e) => setContact(e.target.value)} className="rounded-sm bg-sunken" aria-label={t.contact} />
                  <Button type="submit" size="lg" disabled={status === "sending"} className="label-caps rounded-sm">
                    {status === "sending" ? t.sending : t.submit}
                    <ArrowRight />
                  </Button>
                  {status === "error" && <p className="text-xs text-destructive">{t.error}</p>}
                </form>
              )}
              <p className="mt-2.5 text-[11.5px] leading-normal text-faint">{t.disclaimer}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
