import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/format";
import { submitLead } from "@/lib/leads.functions";
import type { Content } from "@/lib/content";
import {
  fetchWizardConfig,
  fetchWizardRecommendation,
  submitWizardLead,
  type WizardAnswers,
  type WizardContact,
  type WizardConfig,
  type WizardQuestion,
  type WizardRecommendation,
} from "@/lib/partner-wizard-api";
import { AppointmentPicker, WizardContactFields, contactMissing } from "./wizard-contact";

function optionValue(q: WizardQuestion, o: WizardQuestion["options"][number]): string {
  if (q.questionType === "vehicleType") return String(o.id);
  return o.value ?? String(o.id ?? "");
}

function optionTitle(o: WizardQuestion["options"][number]): string {
  return o.title ?? o.name ?? "";
}

function isVisible(q: WizardQuestion, answers: WizardAnswers): boolean {
  if (!q.dependsOnAnswerKey) return true;
  const dep = answers[q.dependsOnAnswerKey];
  if (Array.isArray(dep)) return dep.map(String).includes(q.dependsOnValue ?? "");
  return String(dep ?? "") === q.dependsOnValue;
}

function OptionTile({
  selected,
  title,
  text,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  text?: string | null;
  icon?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-sm border px-4 py-3.5 text-left transition-colors",
        selected ? "border-primary bg-primary-soft" : "hover:border-border-strong",
      )}
    >
      {icon && <img src={icon} alt="" loading="lazy" className="size-8 shrink-0 object-contain" />}
      <span className="flex-1">
        <span className="block font-display font-bold uppercase text-strong">{title}</span>
        {text && <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>}
      </span>
      <span
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "text-transparent",
        )}
      >
        <Check className="size-3" />
      </span>
    </button>
  );
}

function VehicleTypeCard({
  selected,
  title,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  icon?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-center gap-2.5 rounded-sm border px-3 py-4 text-center transition-colors",
        selected ? "border-primary bg-primary-soft" : "hover:border-border-strong",
      )}
    >
      <span
        className={cn(
          "absolute right-2 top-2 inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "text-transparent",
        )}
      >
        <Check className="size-2.5" />
      </span>
      {icon && <img src={icon} alt="" loading="lazy" className="size-14 shrink-0 object-contain" width={56} height={56} />}
      <span className="font-display text-sm font-bold uppercase leading-tight text-strong">{title}</span>
    </button>
  );
}

function QuestionBlock({
  q,
  answers,
  onAnswer,
}: {
  q: WizardQuestion;
  answers: WizardAnswers;
  onAnswer: (key: string, value: string | string[] | number[]) => void;
}) {
  const current = answers[q.answerKey];

  const toggle = (raw: string) => {
    if (q.questionType === "vehicleType") {
      const id = Number(raw);
      const list = Array.isArray(current) ? (current as number[]) : [];
      onAnswer(q.answerKey, list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
      return;
    }
    if (q.multiSelect) {
      const list = Array.isArray(current) ? (current as string[]) : [];
      onAnswer(q.answerKey, list.includes(raw) ? list.filter((v) => v !== raw) : [...list, raw]);
      return;
    }
    onAnswer(q.answerKey, raw);
  };

  const isSelected = (raw: string) => {
    if (q.questionType === "vehicleType") return Array.isArray(current) && (current as number[]).includes(Number(raw));
    if (q.multiSelect) return Array.isArray(current) && (current as string[]).includes(raw);
    return current === raw;
  };

  return (
    <fieldset className="grid gap-2.5">
      <legend className="label-caps mb-1 text-xs text-strong">{q.title}</legend>
      {q.helpText && <p className="text-sm text-muted-foreground">{q.helpText}</p>}
      {q.questionType === "vehicleType" ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {q.options.map((o) => {
            const raw = optionValue(q, o);
            return (
              <VehicleTypeCard
                key={raw}
                selected={isSelected(raw)}
                title={optionTitle(o)}
                icon={o.icon ?? o.imageUrl}
                onClick={() => toggle(raw)}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.options.map((o) => {
            const raw = optionValue(q, o);
            return (
              <OptionTile
                key={raw}
                selected={isSelected(raw)}
                title={optionTitle(o)}
                text={o.text}
                icon={o.icon ?? o.imageUrl}
                onClick={() => toggle(raw)}
              />
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function RecommendationView({ rec, c }: { rec: WizardRecommendation; c: Content }) {
  return (
    <div className="grid gap-5">
      <div className="rounded-sm border border-primary bg-primary-soft px-4 py-4">
        <div className="label-caps text-xs text-primary">{rec.packageKey.replace(/_/g, " ")}</div>
        <h4 className="mt-1 text-2xl">{rec.packageTitle}</h4>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{rec.packageText}</p>
        {rec.packageFeatures.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {rec.packageFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {rec.recommendedTools.length > 0 && (
        <div className="grid gap-2.5">
          {rec.recommendedTools.map((tool) => {
            const price = tool.product?.specialPrice ?? tool.product?.price;
            return (
              <div key={tool.key} className="flex items-center gap-3.5 rounded-sm border px-4 py-3.5">
                {tool.imageUrl && <img src={tool.imageUrl} alt="" loading="lazy" className="size-10 shrink-0 object-contain" />}
                <span className="flex-1">
                  <span className="block font-display font-bold uppercase text-strong">{tool.name}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{tool.description}</span>
                </span>
                {price && (
                  <span className="whitespace-nowrap font-mono text-sm tabular-nums text-strong">
                    {formatEuro(Number(price), c.locale)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rec.estimatedMonthlyRevenue != null && rec.estimatedMonthlyRevenue > 0 && (
        <p className="text-sm text-muted-foreground">
          {c.calculator.perMonth}:{" "}
          <span className="font-mono font-semibold tabular-nums text-strong">
            {formatEuro(rec.estimatedMonthlyRevenue, c.locale)}
          </span>
        </p>
      )}
      {rec.disclaimer && <p className="text-xs leading-relaxed text-faint">{rec.disclaimer}</p>}
    </div>
  );
}

/** Native DCT partner wizard (client tfd) rendered in the site's own design. */
export function PartnerWizardDct({ c }: { c: Content }) {
  const t = c.wizard;
  const [config, setConfig] = useState<WizardConfig | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [contact, setContact] = useState<WizardContact>({});
  const [slot, setSlot] = useState("");
  const [rec, setRec] = useState<WizardRecommendation | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "sending" | "done" | "error" | "invalid">("idle");

  useEffect(() => {
    let cancelled = false;
    fetchWizardConfig()
      .then((cfg) => {
        if (!cancelled) setConfig(cfg);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const steps = useMemo(() => config?.steps ?? [], [config]);
  const currentStep = steps[step];

  const onAnswer = (key: string, value: string | string[] | number[]) =>
    setAnswers((s) => ({ ...s, [key]: value }));

  const contactQuestions = steps.find((s) => s.type === "contact")?.questions.filter((q) => isVisible(q, answers)) ?? [];
  const contactValid = !contactMissing(contactQuestions, contact) && !(config?.appointment?.enabled && config.appointment.required && !slot);
  const str = (k: string) => (typeof contact[k] === "string" ? (contact[k] as string).trim() : "");

  const next = async () => {
    if (!currentStep) return;
    if (currentStep.type === "contact") return;
    setStatus("idle");
    const nextIndex = step + 1;
    const nextStep = steps[nextIndex];
    if (nextStep?.type === "recommendation") {
      setStatus("loading");
      try {
        const recommendation = await fetchWizardRecommendation(answers);
        setRec(recommendation);
        setStatus("idle");
        setStep(nextIndex);
      } catch {
        setStatus("error");
      }
      return;
    }
    setStep(nextIndex);
  };

  const submit = async () => {
    if (!contactValid) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      await submitWizardLead(answers, contact, slot || undefined);
      // Keep the owner notifications (WhatsApp/email) that run on stored leads.
      submitLead({
        data: {
          source: "wizard",
          locale: c.locale,
          company: str("company"),
          contactName: str("name"),
          email: str("email"),
          phone: str("phone"),
          details: { ...Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, (Array.isArray(value) ? value.join(", ") : String(value)).slice(0, 300)])), package: rec?.packageKey ?? "", dctWizard: "tfd", ...(slot ? { termin: slot } : {}) },
        },
      }).catch((error) => console.error("Lead notification storage failed:", error));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (loadError) {
    return (
      <div className="rounded-md border bg-card px-6 py-12 text-center">
        <p role="alert" className="text-sm text-destructive">{t.error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center rounded-md border bg-card px-6 py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-md border bg-card px-6 py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary bg-primary-soft">
          <Check className="size-7 text-primary" />
        </div>
        <h3 className="mt-5 text-3xl">{t.done.title}</h3>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">{t.done.text}</p>
      </motion.div>
    );
  }

  const visibleQuestions = currentStep?.questions.filter((q) => isVisible(q, answers)) ?? [];

  return (
    <div>
      <div className="mb-8 grid gap-2.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => {
          const active = i <= step;
          return (
            <div key={s.key} className="grid gap-2">
              <div className="h-[3px] overflow-hidden bg-border">
                <div className={cn("h-full bg-primary transition-all duration-500", active ? "w-full" : "w-0")} />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full border font-mono text-[11px]",
                    i < step && "border-primary bg-primary text-primary-foreground",
                    i === step && "border-primary text-primary",
                    i > step && "text-faint",
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span className={cn("label-caps hidden text-xs sm:inline", active ? "text-strong" : "text-faint")}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-md border bg-card p-5 md:p-7">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep?.key ?? step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <h3 className="text-2xl">{currentStep?.label}</h3>

            {currentStep?.type === "questions" && (
              <div className="mt-5 grid gap-6">
                {visibleQuestions.map((q) => (
                  <QuestionBlock key={q.answerKey} q={q} answers={answers} onAnswer={onAnswer} />
                ))}
              </div>
            )}

            {currentStep?.type === "recommendation" && rec && (
              <div className="mt-5">
                <RecommendationView rec={rec} c={c} />
              </div>
            )}

            {currentStep?.type === "contact" && (
              <div className="mt-5 grid gap-5">
                <WizardContactFields questions={visibleQuestions} values={contact} onChange={(k, v) => setContact((s) => ({ ...s, [k]: v }))} />
                {config.appointment?.enabled && <AppointmentPicker settings={config.appointment} locale={c.locale} value={slot} onChange={setSlot} />}
                {config.privacyNotice && <p className="text-xs leading-relaxed text-faint">{config.privacyNotice}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {(status === "invalid" || status === "error") && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {status === "invalid" ? t.required : t.error}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between gap-3 border-t pt-5">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="label-caps rounded-sm">
            <ArrowLeft />
            {t.back}
          </Button>
          {currentStep?.type === "contact" ? (
            <Button onClick={submit} size="lg" disabled={status === "sending"} className="label-caps rounded-sm">
              {status === "sending" ? t.sending : t.submit}
              <ArrowRight />
            </Button>
          ) : (
            <Button onClick={next} size="lg" disabled={status === "loading"} className="label-caps rounded-sm">
              {status === "loading" ? <Loader2 className="animate-spin" /> : null}
              {currentStep?.type === "recommendation" && rec ? rec.nextStep || t.next : t.next}
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      <details className="mt-6 rounded-md border bg-card">
        <summary className="label-caps cursor-pointer select-none px-4 py-3 text-xs text-faint">
          {c.locale === "en" ? "Debug: wizard data (JSON)" : "Debug: Wizard-Daten (JSON)"}
        </summary>
        <pre className="max-h-[480px] overflow-auto border-t px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
          {JSON.stringify(
            {
              step: { index: step, key: currentStep?.key ?? null, type: currentStep?.type ?? null },
              status,
              answers,
              contact,
              appointment: slot,
              recommendation: rec,
              config,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
