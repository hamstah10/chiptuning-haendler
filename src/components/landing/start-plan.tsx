import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2, Printer, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateStartPlan, refineStartPlan, refineStartPlanSchema, startPlanSchema } from "@/lib/startplan.functions";
import { formatDate } from "@/lib/format";
import type { Content } from "@/lib/content";

const STORAGE_KEY = "tuningfiles-startplan";

type PlanContent = Content["startPlan"];

/** Renders the model's Markdown answer: ## headings, - bullets, plain paragraphs. */
function PlanMarkdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="grid gap-5">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h3 key={i} className="font-display text-xl font-bold uppercase text-strong">
              {block.replace(/^##\s+/, "")}
            </h3>
          );
        }
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="grid gap-2.5">
              {lines.map((l, j) => (
                <li key={j} className="flex items-start gap-2.5 leading-relaxed text-muted-foreground">
                  <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" />
                  {l.replace(/^-\s+/, "")}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-muted-foreground">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function PlanSelect({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="label-caps text-xs text-strong">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-11 rounded-sm bg-sunken">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function StartPlan({ c }: { c: Content }) {
  const t: PlanContent = c.startPlan;

  const first = (options: string[]) => options[0] ?? "";
  const [fields, setFields] = useState({
    experience: first(t.options.experience),
    businessType: first(t.options.businessType),
    weeklyHours: first(t.options.weeklyHours),
    timeframe: first(t.options.timeframe),
    goal: first(t.options.goal),
    note: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [plan, setPlan] = useState("");
  const [errorText, setErrorText] = useState("");
  const [refineText, setRefineText] = useState("");
  const [refineStatus, setRefineStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [refineResult, setRefineResult] = useState("");
  const [refineError, setRefineError] = useState("");
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [restored, setRestored] = useState(false);

  // Restore a previously saved plan after hydration (browser-only storage).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { plan?: unknown; refineResult?: unknown; createdAt?: unknown };
      if (typeof saved.plan !== "string" || !saved.plan.trim()) return;
      setPlan(saved.plan);
      if (typeof saved.refineResult === "string" && saved.refineResult.trim()) {
        setRefineResult(saved.refineResult);
        setRefineStatus("done");
      }
      setCreatedAt(typeof saved.createdAt === "string" ? new Date(saved.createdAt) : new Date());
      setStatus("done");
      setRestored(true);
    } catch {
      // Ignore broken or foreign storage content.
    }
  }, []);

  const persist = (nextPlan: string, nextRefine: string, date: Date) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ plan: nextPlan, refineResult: nextRefine, createdAt: date.toISOString() }),
      );
    } catch {
      // Storage may be unavailable (private mode) – the plan still shows on screen.
    }
  };

  const set = (k: keyof typeof fields) => (v: string) => setFields((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    const input = {
      locale: c.locale,
      experience: fields.experience,
      businessType: fields.businessType,
      weeklyHours: fields.weeklyHours,
      timeframe: fields.timeframe,
      goal: fields.goal,
      ...(fields.note.trim() ? { note: fields.note.trim() } : {}),
    };
    if (!startPlanSchema.safeParse(input).success) return;
    setStatus("sending");
    setErrorText("");
    try {
      const res = await generateStartPlan({ data: input });
      if (res.ok) {
        const now = new Date();
        setPlan(res.plan);
        setStatus("done");
        setRefineText("");
        setRefineStatus("idle");
        setRefineResult("");
        setRefineError("");
        setCreatedAt(now);
        setRestored(false);
        persist(res.plan, "", now);
      } else {
        setErrorText(res.error);
        setStatus("error");
      }
    } catch {
      setErrorText(t.error);
      setStatus("error");
    }
  };

  const refine = async () => {
    const input = { locale: c.locale, plan, description: refineText.trim() };
    if (!refineStartPlanSchema.safeParse(input).success) return;
    setRefineStatus("sending");
    setRefineError("");
    try {
      const res = await refineStartPlan({ data: input });
      if (res.ok) {
        setRefineResult(res.plan);
        setRefineStatus("done");
        persist(plan, res.plan, createdAt ?? new Date());
      } else {
        setRefineError(res.error);
        setRefineStatus("error");
      }
    } catch {
      setRefineError(t.refine.error);
      setRefineStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setPlan("");
    setErrorText("");
    setRefineText("");
    setRefineStatus("idle");
    setRefineResult("");
    setRefineError("");
    setCreatedAt(null);
    setRestored(false);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-md border bg-card p-5 md:p-7">
        <div className="grid gap-4">
          <PlanSelect id="sp-experience" label={t.fields.experience} options={t.options.experience} value={fields.experience} onChange={set("experience")} />
          <PlanSelect id="sp-business" label={t.fields.businessType} options={t.options.businessType} value={fields.businessType} onChange={set("businessType")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PlanSelect id="sp-hours" label={t.fields.weeklyHours} options={t.options.weeklyHours} value={fields.weeklyHours} onChange={set("weeklyHours")} />
            <PlanSelect id="sp-timeframe" label={t.fields.timeframe} options={t.options.timeframe} value={fields.timeframe} onChange={set("timeframe")} />
          </div>
          <PlanSelect id="sp-goal" label={t.fields.goal} options={t.options.goal} value={fields.goal} onChange={set("goal")} />
          <div className="grid gap-1.5">
            <Label htmlFor="sp-note" className="label-caps text-xs text-strong">
              {t.fields.note}
            </Label>
            <Textarea
              id="sp-note"
              placeholder={t.fields.notePh}
              value={fields.note}
              maxLength={500}
              rows={3}
              onChange={(e) => set("note")(e.target.value)}
              className="rounded-sm bg-sunken"
            />
          </div>
        </div>

        {status === "error" && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {errorText || t.error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
          <Button onClick={submit} size="lg" disabled={status === "sending"} className="label-caps rounded-sm">
            {status === "sending" ? (
              <>
                <Loader2 className="animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                {t.submit}
                <ArrowRight />
              </>
            )}
          </Button>
          {status === "done" && (
            <Button variant="ghost" onClick={reset} className="label-caps rounded-sm">
              <RotateCcw />
              {t.retry}
            </Button>
          )}
        </div>
        <p className="mt-4 text-xs text-faint">{t.disclaimer}</p>
      </div>

      <div className="rounded-md border bg-card p-5 md:p-7">
        <AnimatePresence mode="wait">
          {status === "done" ? (
            <motion.div key="plan" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="mb-5 flex items-center gap-2.5 border-b pb-4">
                <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <span className="label-caps text-sm text-strong">{t.resultTitle}</span>
              </div>
              <PlanMarkdown text={plan} />

              <div className="mt-7 grid gap-4 rounded-sm border bg-sunken p-4 md:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-sm border bg-card text-primary">
                    <SlidersHorizontal className="size-4" />
                  </span>
                  <span className="label-caps text-sm text-strong">{t.refine.title}</span>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="sp-refine" className="text-xs text-muted-foreground">
                    {t.refine.label}
                  </Label>
                  <Textarea
                    id="sp-refine"
                    placeholder={t.refine.ph}
                    value={refineText}
                    maxLength={1000}
                    rows={3}
                    onChange={(e) => setRefineText(e.target.value)}
                    className="rounded-sm bg-card"
                  />
                </div>
                {refineStatus === "error" && (
                  <p role="alert" className="text-sm text-destructive">
                    {refineError || t.refine.error}
                  </p>
                )}
                <div>
                  <Button
                    onClick={refine}
                    variant="outline"
                    disabled={refineStatus === "sending" || refineText.trim().length < 5}
                    className="label-caps rounded-sm"
                  >
                    {refineStatus === "sending" ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {t.refine.generating}
                      </>
                    ) : (
                      <>
                        {t.refine.submit}
                        <ArrowRight />
                      </>
                    )}
                  </Button>
                </div>
                {refineStatus === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 border-t pt-4"
                  >
                    <span className="label-caps text-xs text-primary">{t.refine.resultTitle}</span>
                    <PlanMarkdown text={refineResult} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full min-h-64 flex-col items-center justify-center gap-4 text-center">
              {status === "sending" ? (
                <>
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.generatingHint}</p>
                </>
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-sm border bg-sunken text-primary">
                    <Sparkles className="size-5" />
                  </span>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.placeholder}</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
