import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Car, Check, Globe, Loader2, Mail, Rocket, Sparkles } from "lucide-react";
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
import { ChipGroup, ChoiceCards, ImageCards, LogoTiles, SegmentedControl, type FieldOption } from "./wizard-fields";
import { pickVariant } from "@/lib/wizard-variants";

/** Icon per wizard step, matched by position. */
const STEP_ICONS = [Rocket, Car, Globe, Sparkles, Mail];

/** Local marker for "no tool yet"; never sent to the portal. */
const NO_TOOL = "__none__";
const portalAnswers = (a: WizardAnswers): WizardAnswers => Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v === NO_TOOL ? "" : v]));

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

function QuestionBlock({
  q,
  answers,
  onAnswer,
  locale,
}: {
  q: WizardQuestion;
  answers: WizardAnswers;
  onAnswer: (key: string, value: string | string[] | number[]) => void;
  locale: "de" | "en";
}) {
  const en = locale === "en";
  const current = answers[q.answerKey];
  const variant = pickVariant(q);
  const options: FieldOption[] = q.options.map((o) => ({ value: optionValue(q, o), title: optionTitle(o), text: o.text, icon: o.icon ?? o.imageUrl }));
  const list = Array.isArray(current) ? (current as (string | number)[]).map(String) : [];
  const multi = q.questionType === "vehicleType" || q.multiSelect;
  const isOn = (raw: string) => (multi ? list.includes(raw) : current === raw);
  const setList = (next: string[]) => onAnswer(q.answerKey, q.questionType === "vehicleType" ? next.map(Number) : next);
  const toggle = (raw: string) => {
    if (multi) return setList(list.includes(raw) ? list.filter((v) => v !== raw) : [...list, raw]);
    onAnswer(q.answerKey, current === raw ? "" : raw);
  };

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="label-caps text-xs text-strong">{q.title}</span>
        {multi && <span className="text-xs text-faint">{en ? "Multiple choice" : "Mehrfachauswahl"}</span>}
      </legend>
      {q.helpText && <p className="-mt-1 text-sm text-muted-foreground">{q.helpText}</p>}
      {variant === "imageCards" && (
        <ImageCards options={options} isOn={isOn} onToggle={toggle} countLabel={(n) => (en ? `${n} selected` : `${n} gewählt`)} />
      )}
      {variant === "logoTiles" && (
        <LogoTiles options={options} isOn={isOn} onToggle={toggle} noneLabel={en ? "No tool yet" : "Noch kein Tool"} noneOn={current === NO_TOOL} onNone={() => onAnswer(q.answerKey, current === NO_TOOL ? "" : NO_TOOL)} />
      )}
      {variant === "choiceCards" && <ChoiceCards options={options} isOn={isOn} onToggle={toggle} />}
      {variant === "segmented" && <SegmentedControl options={options} value={String(current ?? "")} onChange={(v) => onAnswer(q.answerKey, v)} label={q.title} />}
      {variant === "chips" && (
        <ChipGroup options={options} isOn={isOn} onToggle={toggle}
          onAll={multi ? () => setList(options.map((o) => o.value)) : undefined}
          onReset={multi ? () => setList([]) : undefined}
          allLabel={en ? "Select all" : "Alle wählen"} resetLabel={en ? "Reset" : "Zurücksetzen"} />
      )}
    </fieldset>
  );
}

/** Human-readable labels for an answered question (used in the summary). */
function answerLabels(q: WizardQuestion, value: WizardAnswers[string] | undefined, locale: "de" | "en"): string[] {
  if (value == null || value === "") return [];
  if (value === NO_TOOL) return [locale === "en" ? "No tool yet" : "Noch kein Tool"];
  const raws = Array.isArray(value) ? value.map(String) : [String(value)];
  return raws.map((r) => optionTitle(q.options.find((o) => optionValue(q, o) === r) ?? ({} as WizardQuestion["options"][number])) || r);
}

function RecommendationView({ rec, c }: { rec: WizardRecommendation; c: Content }) {
  return (
    <div className="grid gap-5">
      <div className="rounded-sm border border-primary border-l-4 bg-primary-soft px-5 py-5">
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
              <div key={tool.key} className="flex items-center gap-3.5 rounded-sm border border-border-strong bg-sunken px-4 py-3.5">
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
  const [submitError, setSubmitError] = useState("");
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

  const reduce = useReducedMotion();
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
        const recommendation = await fetchWizardRecommendation(portalAnswers(answers));
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
    setSubmitError("");
    try {
      await submitWizardLead(portalAnswers(answers), contact, slot || undefined);
      // Keep the owner notifications (WhatsApp/email) that run on stored leads.
      submitLead({
        data: {
          source: "wizard",
          locale: c.locale,
          company: str("company"),
          contactName: str("name"),
          email: str("email"),
          phone: str("phone"),
          details: { ...Object.fromEntries(Object.entries(portalAnswers(answers)).map(([key, value]) => [key, (Array.isArray(value) ? value.join(", ") : String(value)).slice(0, 300)])), package: rec?.packageKey ?? "", dctWizard: "tfd", ...(slot ? { termin: slot } : {}) },
        },
      }).catch((error) => console.error("Lead notification storage failed:", error));
      setStatus("done");
    } catch (error) {
      const status = (error as { status?: number }).status;
      const message = error instanceof Error && status ? error.message : "";
      setSubmitError(status === 409 && !message ? (c.locale === "de" ? "Dieser Termin ist nicht mehr frei. Bitte wähle einen anderen." : "This slot is no longer available. Please pick another one.") : message);
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

  const answeredSummary = steps.slice(0, step).flatMap((s, i) =>
    s.type === "questions"
      ? s.questions
          .filter((q) => isVisible(q, answers))
          .flatMap((q) => {
            const labels = answerLabels(q, answers[q.answerKey], c.locale);
            return labels.length > 0 ? [{ title: q.title, labels, step: i, key: q.answerKey }] : [];
          })
      : [],
  );

  return (
    <div>
      <div className="overflow-hidden rounded-md border border-border-strong bg-card">
        <div className="h-[3px] bg-border"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>

        <div>
          <ol className="grid border-b bg-sunken/40" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((s, i) => {
              const StepIcon = STEP_ICONS[i] ?? Sparkles;
              return (
              <li key={s.key} className="relative">
                <button type="button" disabled={i > step} onClick={() => setStep(i)}
                  className={cn("flex w-full items-center justify-center gap-1.5 px-2 py-3 text-center font-mono text-[10px] uppercase tracking-wider transition-colors sm:text-[11px]",
                    i <= step ? "text-strong" : "text-faint", i < step && "hover:text-primary")}>
                  {i < step ? (
                    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-2.5" />
                    </span>
                  ) : (
                    <StepIcon className={cn("size-3.5 shrink-0", i === step ? "text-primary" : "text-faint")} />
                  )}
                  <span className={cn("hidden sm:inline", i < step && "text-primary")}>{s.label}</span>
                </button>
                {i === step && (
                  <motion.span layoutId="wizard-step" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                )}
              </li>
              );
            })}
          </ol>

          <div className="p-5 md:p-7">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep?.key ?? step} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                <div className="label-caps text-xs text-primary">{c.locale === "en" ? "Step" : "Schritt"} {String(step + 1).padStart(2, "0")}</div>
                <h3 className="mt-1 text-2xl">{currentStep?.label}</h3>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
                <div>
                {currentStep?.type === "questions" && (
                  <div className="grid gap-7">
                    {visibleQuestions.map((q) => (
                      <QuestionBlock key={q.answerKey} q={q} answers={answers} onAnswer={onAnswer} locale={c.locale} />
                    ))}
                  </div>
                )}

                {currentStep?.type === "recommendation" && rec && (
                  <div>
                    <RecommendationView rec={rec} c={c} />
                  </div>
                )}

                {currentStep?.type === "contact" && (
                  <div className="grid gap-6">
                    <WizardContactFields questions={visibleQuestions} values={contact} onChange={(k, v) => setContact((s) => ({ ...s, [k]: v }))} showErrors={status === "invalid"} locale={c.locale} />
                    {config.appointment?.enabled && <AppointmentPicker settings={config.appointment} locale={c.locale} value={slot} onChange={setSlot} />}
                    {config.privacyNotice && <p className="text-xs leading-relaxed text-faint">{config.privacyNotice}</p>}
                  </div>
                )}
                </div>

                <div>
                  <div className="label-caps text-xs text-faint">{c.locale === "en" ? "Your selection" : "Deine Auswahl"}</div>
                  <div className="mt-4 rounded-sm border bg-sunken px-4 py-3.5">
                    {answeredSummary.length > 0 ? (
                      <div className="grid gap-3">
                        {answeredSummary.map((a) => (
                          <button key={a.key} type="button" onClick={() => setStep(a.step)} title={c.locale === "en" ? "Edit" : "Ändern"} className="group text-left">
                            <span className="label-caps block text-[11px] text-faint transition-colors group-hover:text-primary">{a.title}</span>
                            <span className="mt-1 flex flex-wrap gap-1.5">
                              {a.labels.map((label) => (
                                <span key={label} className="rounded-full border border-border-strong bg-card px-2 py-0.5 text-xs text-foreground transition-colors group-hover:border-primary">{label}</span>
                              ))}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed text-faint">
                        {c.locale === "en" ? "Your answers will appear here as you go." : "Deine Antworten erscheinen hier, sobald du weitergehst."}
                      </p>
                    )}
                  </div>
                  {rec && (
                    <div className="mt-4 rounded-sm border border-primary border-l-4 bg-primary-soft px-4 py-3.5">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-primary">{c.locale === "en" ? "Recommendation" : "Empfehlung"}</div>
                      <div className="mt-1 font-display font-bold uppercase text-strong">{rec.packageTitle}</div>
                      {rec.estimatedMonthlyRevenue != null && rec.estimatedMonthlyRevenue > 0 && (
                        <div className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                          {c.calculator.perMonth}: {formatEuro(rec.estimatedMonthlyRevenue, c.locale)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {(status === "invalid" || status === "error") && (
              <p role="alert" className="mt-5 text-sm text-destructive">
                {status === "invalid" ? t.required : submitError || t.error}
              </p>
            )}

            <div className="mt-7 flex items-center justify-between gap-3 border-t pt-5">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="label-caps h-10 rounded-sm border-border-strong bg-sunken shadow-none">
                <ArrowLeft />
                {t.back}
              </Button>
              {currentStep?.type === "contact" ? (
                <Button onClick={submit} disabled={status === "sending"} className="label-caps h-10 rounded-sm shadow-none">
                  {status === "sending" ? <Loader2 className="animate-spin" /> : null}
                  {status === "sending" ? t.sending : t.submit}
                  <ArrowRight />
                </Button>
              ) : (
                <Button onClick={next} disabled={status === "loading"} className="label-caps h-10 rounded-sm shadow-none">
                  {status === "loading" ? <Loader2 className="animate-spin" /> : null}
                  {currentStep?.type === "recommendation" && rec ? rec.nextStep || t.next : t.next}
                  <ArrowRight />
                </Button>
              )}
            </div>
          </div>
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
