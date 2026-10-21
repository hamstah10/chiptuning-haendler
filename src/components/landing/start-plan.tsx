import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateStartPlan, startPlanSchema } from "@/lib/startplan.functions";
import type { Content } from "@/lib/content";

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
  const run = useServerFn(generateStartPlan);

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
      const res = await run({ data: input });
      if (res.ok) {
        setPlan(res.plan);
        setStatus("done");
      } else {
        setErrorText(res.error);
        setStatus("error");
      }
    } catch {
      setErrorText(t.error);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setPlan("");
    setErrorText("");
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
