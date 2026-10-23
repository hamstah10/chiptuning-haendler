import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Cpu, Download, FileCode2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { Content } from "@/lib/content";

const STATUS_MS = 1600;

export function FileServiceTeaser({ c }: { c: Content }) {
  const p = c.portal;
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState(0);
  const [selected, setSelected] = useState<string[]>(["stage1"]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [notice, setNotice] = useState(false);

  const chosen = p.options.filter((o) => selected.includes(o.id));
  const credits = chosen.reduce((sum, o) => sum + o.credits, 0);
  const minutes = chosen.reduce((sum, o) => sum + o.minutes, 0);
  const v = p.vehicles[vehicle];
  const outName = v.file.replace("stock", selected.join("_") || "mod");

  useEffect(() => {
    if (step !== 2) return;
    if (statusIndex >= p.statuses.length) {
      setStep(3);
      return;
    }
    const t = window.setTimeout(() => setStatusIndex((i) => i + 1), reduce ? 400 : STATUS_MS);
    return () => window.clearTimeout(t);
  }, [step, statusIndex, p.statuses.length, reduce]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const restart = () => {
    setStep(0);
    setStatusIndex(0);
    setNotice(false);
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase text-muted-foreground">
          <Cpu className="size-4 text-primary" />
          File-Service
        </div>
        <span className="rounded-sm bg-primary px-2 py-0.5 font-mono text-[10px] uppercase text-primary-foreground">
          {p.demoBadge}
        </span>
      </div>

      <ol className="grid grid-cols-4 border-b">
        {p.stepLabels.map((label, i) => (
          <li
            key={label}
            className={cn(
              "relative px-2 py-3 text-center font-mono text-[10px] uppercase sm:text-[11px]",
              i <= step ? "text-strong" : "text-faint",
            )}
          >
            <span className="mr-1 text-primary">{String(i + 1).padStart(2, "0")}</span>
            <span className="hidden sm:inline">{label}</span>
            {i === step && (
              <motion.span layoutId="portal-step" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </li>
        ))}
      </ol>

      <div className="min-h-[340px] p-5 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h3 className="text-lg">{p.chooseVehicle}</h3>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {p.vehicles.map((item, i) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setVehicle(i)}
                      aria-pressed={vehicle === i}
                      className={cn(
                        "rounded-md border p-4 text-left transition-colors",
                        vehicle === i ? "border-primary bg-primary/5" : "hover:border-foreground/30",
                      )}
                    >
                      <div className="font-display font-bold text-strong">{item.name}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase text-muted-foreground">{item.ecu}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-md border border-dashed p-4">
                  <FileCode2 className="size-5 text-primary" />
                  <div>
                    <div className="font-mono text-[11px] uppercase text-faint">{p.originalFile}</div>
                    <div className="font-mono text-sm text-strong">{v.file}</div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep(1)}>
                    {p.next} <ArrowRight />
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-lg">{p.chooseOptions}</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.options.map((o) => (
                    <label
                      key={o.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-4",
                        selected.includes(o.id) && "border-primary bg-primary/5",
                      )}
                    >
                      <Checkbox checked={selected.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
                      <span className="text-sm text-strong">{o.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-4">
                    <div className="font-mono text-[11px] uppercase text-faint">{p.credits}</div>
                    <div className="font-display text-2xl font-bold text-primary">
                      {formatNumber(credits, c.locale)}
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="font-mono text-[11px] uppercase text-faint">{p.estimate}</div>
                    <div className="font-display text-2xl font-bold text-strong">
                      ~{minutes} {p.minutes}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    {p.back}
                  </Button>
                  <Button
                    disabled={selected.length === 0}
                    onClick={() => {
                      setStatusIndex(0);
                      setStep(2);
                    }}
                  >
                    {p.submit} <ArrowRight />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="font-mono text-sm text-strong">{v.file}</div>
                <Progress className="mt-4" value={(statusIndex / p.statuses.length) * 100} />
                <ul className="mt-6 space-y-3">
                  {p.statuses.map((s, i) => (
                    <li key={s} className={cn("flex items-center gap-3 text-sm", i > statusIndex && "text-faint")}>
                      {i < statusIndex ? (
                        <Check className="size-4 text-primary" />
                      ) : i === statusIndex ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <span className="size-4 rounded-full border" />
                      )}
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    {p.skip}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-5" />
                  </span>
                  <h3 className="text-lg">{p.doneTitle}</h3>
                </div>
                <p className="mt-3 max-w-xl text-muted-foreground">{p.doneText}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md border p-4">
                  <FileCode2 className="size-5 text-primary" />
                  <span className="font-mono text-sm text-strong">{outName}</span>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => setNotice(true)}>
                    <Download /> {p.download}
                  </Button>
                </div>
                {notice && <p className="mt-2 text-xs text-muted-foreground">{p.downloadNote}</p>}
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <Button variant="outline" onClick={restart}>
                    <RotateCcw /> {p.restart}
                  </Button>
                  <Button asChild>
                    <a href="#anmeldung">
                      {p.cta} <ArrowRight />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
