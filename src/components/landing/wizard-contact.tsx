import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchWizardAppointments, type WizardConfig, type WizardContact, type WizardDay, type WizardQuestion } from "@/lib/partner-wizard-api";
import { ChipGroup, SegmentedControl, type FieldOption } from "./wizard-fields";

const fieldClass = "h-10 w-full rounded-sm border border-border-strong bg-sunken px-3 text-sm shadow-none outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30";
const optTitle = (o: WizardQuestion["options"][number]) => o.title ?? o.name ?? o.text ?? o.value ?? "";
const toOptions = (q: WizardQuestion): FieldOption[] => q.options.map((o) => ({ value: o.value ?? String(o.id), title: optTitle(o), text: o.text }));
const emailOk = (x: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x));

function fieldError(q: WizardQuestion, x: WizardContact[string] | undefined): boolean {
  if (q.fieldType === "email" && x && !emailOk(x)) return true;
  if (!q.required) return false;
  if (q.fieldType === "checkbox") return q.options.length ? !(Array.isArray(x) && x.length) : x !== true;
  return !String(x ?? "").trim();
}

export function contactMissing(questions: WizardQuestion[], v: WizardContact): boolean {
  return questions.some((q) => fieldError(q, v[q.answerKey]));
}

function Field({ q, value, onChange, showErrors, locale }: { q: WizardQuestion; value: WizardContact[string] | undefined; onChange: (v: WizardContact[string]) => void; showErrors: boolean; locale: "de" | "en" }) {
  const id = `dct-${q.answerKey}`;
  const label = <>{q.title}{q.required ? <span className="text-primary"> *</span> : null}</>;
  const err = showErrors && fieldError(q, value);
  const errText = q.fieldType === "email" && value ? (locale === "en" ? "Please enter a valid email address." : "Bitte gib eine gültige E-Mail-Adresse ein.") : locale === "en" ? "Required field." : "Pflichtfeld.";
  const errNode = err ? <p id={`${id}-err`} className="text-xs text-destructive">{errText}</p> : null;

  if (q.fieldType === "checkbox" && !q.options.length) {
    return (
      <div className="grid gap-1 sm:col-span-2">
        <div className={cn("flex items-start gap-3 rounded-sm border bg-sunken px-3.5 py-3", err ? "border-destructive" : "border-border-strong")}>
          <Switch id={id} checked={value === true} onCheckedChange={(c) => onChange(c === true)} className="mt-0.5" aria-invalid={err} />
          <Label htmlFor={id} className="text-sm font-normal leading-relaxed text-foreground">{label}</Label>
        </div>
        {errNode}
      </div>
    );
  }
  if (q.fieldType === "checkbox") {
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset className="grid gap-2 sm:col-span-2">
        <legend className="label-caps mb-1.5 text-xs text-strong">{label}</legend>
        <ChipGroup options={toOptions(q)} isOn={(v) => list.includes(v)} onToggle={(v) => onChange(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])} />
        {errNode}
      </fieldset>
    );
  }
  if (q.fieldType === "radio") {
    return (
      <fieldset className="grid gap-2 sm:col-span-2">
        <legend className="label-caps mb-1.5 text-xs text-strong">{label}</legend>
        <SegmentedControl options={toOptions(q)} value={String(value ?? "")} onChange={onChange} label={q.title} />
        {errNode}
      </fieldset>
    );
  }
  return (
    <div className={cn("grid content-start gap-1.5", q.fieldType === "textarea" && "sm:col-span-2")}>
      <Label htmlFor={id} className="label-caps text-xs text-strong">{label}</Label>
      {q.fieldType === "select" ? (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger id={id} aria-invalid={err} className={cn("h-10 rounded-sm border-border-strong bg-sunken shadow-none", err && "border-destructive")}>
            <SelectValue placeholder={locale === "en" ? "Please choose" : "Bitte wählen"} />
          </SelectTrigger>
          <SelectContent>
            {toOptions(q).map((o) => <SelectItem key={o.value} value={o.value}>{o.title}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : q.fieldType === "textarea" ? (
        <textarea id={id} rows={4} maxLength={2000} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} aria-invalid={err} className={cn(fieldClass, "h-auto py-2", err && "border-destructive")} />
      ) : (
        <Input id={id} type={q.fieldType === "email" ? "email" : q.answerKey === "phone" ? "tel" : "text"} autoComplete={q.answerKey === "name" ? "name" : q.answerKey === "company" ? "organization" : q.answerKey === "phone" ? "tel" : q.fieldType === "email" ? "email" : undefined}
          maxLength={255} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} aria-invalid={err} aria-describedby={err ? `${id}-err` : undefined}
          className={cn("h-10 rounded-sm border-border-strong bg-sunken shadow-none", err && "border-destructive")} />
      )}
      {errNode}
    </div>
  );
}

export function WizardContactFields({ questions, values, onChange, showErrors = false, locale = "de" }: { questions: WizardQuestion[]; values: WizardContact; onChange: (key: string, v: WizardContact[string]) => void; showErrors?: boolean; locale?: "de" | "en" }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {questions.map((q) => <Field key={q.answerKey} q={q} value={values[q.answerKey]} onChange={(v) => onChange(q.answerKey, v)} showErrors={showErrors} locale={locale} />)}
    </div>
  );
}

const monthKey = (date: string) => date.slice(0, 7);

/** Month calendar (bookable days) with free time slots on the right. */
export function AppointmentPicker({ settings, locale, value, onChange }: { settings: NonNullable<WizardConfig["appointment"]>; locale: "de" | "en"; value: string; onChange: (start: string) => void }) {
  const [days, setDays] = useState<WizardDay[] | null>(null);
  const [error, setError] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  useEffect(() => {
    let on = true;
    fetchWizardAppointments().then((d) => { if (on) { setDays(d); setDay(d[0]?.date ?? ""); setMonth(d[0] ? monthKey(d[0].date) : ""); } }).catch(() => on && setError(true));
    return () => { on = false; };
  }, []);
  const tag = locale === "en" ? "en-GB" : "de-DE";
  const en = locale === "en";
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag, { timeZone: settings.timezone, ...o }).format(new Date(iso));
  const byDate = useMemo(() => new Map((days ?? []).map((d) => [d.date, d])), [days]);
  const months = useMemo(() => [...new Set((days ?? []).map((d) => monthKey(d.date)))], [days]);
  const active = byDate.get(day);

  const cells = useMemo(() => {
    if (!month) return [];
    const y = Number(month.slice(0, 4));
    const m = Number(month.slice(5, 7));
    const first = new Date(Date.UTC(y, m - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)] as (string | null)[];
  }, [month]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(tag, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i)))), [tag]);
  const mi = months.indexOf(month);

  return (
    <div className="overflow-hidden rounded-sm border border-border-strong bg-sunken">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div className="label-caps text-xs text-strong">{settings.title}{settings.required ? <span className="text-primary"> *</span> : " (optional)"}</div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />{settings.durationMinutes} {en ? "min" : "Min."} · {settings.timezone.replace("_", " ")}</span>
      </div>
      {error ? <p className="p-4 text-sm text-destructive">{en ? "Appointments could not be loaded." : "Termine konnten nicht geladen werden."}</p>
        : !days ? <div className="p-6"><Loader2 className="size-5 animate-spin text-primary" /></div>
        : !days.length ? <p className="p-4 text-sm text-muted-foreground">{en ? "No free appointments." : "Keine freien Termine."}</p>
        : (
          <div className="grid md:grid-cols-[1fr_200px]">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" aria-label={en ? "Previous month" : "Vorheriger Monat"} disabled={mi <= 0} onClick={() => setMonth(months[mi - 1] ?? month)} className="inline-flex size-8 items-center justify-center rounded-sm border border-border-strong disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                <span className="font-display font-bold uppercase text-strong">{fmt(`${month}-15T12:00:00Z`, { month: "long", year: "numeric" })}</span>
                <button type="button" aria-label={en ? "Next month" : "Nächster Monat"} disabled={mi >= months.length - 1} onClick={() => setMonth(months[mi + 1] ?? month)} className="inline-flex size-8 items-center justify-center rounded-sm border border-border-strong disabled:opacity-40"><ChevronRight className="size-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekdays.map((w) => <span key={w} className="label-caps py-1 text-[10px] text-faint">{w}</span>)}
                {cells.map((d, i) => {
                  if (!d) return <span key={`e${i}`} />;
                  const free = byDate.has(d);
                  const on = d === day;
                  return (
                    <button key={d} type="button" disabled={!free} aria-pressed={on} onClick={() => setDay(d)}
                      className={cn("relative aspect-square rounded-sm font-mono text-sm tabular-nums transition-colors",
                        on ? "bg-primary text-primary-foreground" : free ? "border border-border-strong bg-card text-strong hover:border-primary" : "text-faint")}>
                      {Number(d.slice(8))}
                      {free && !on && <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t p-4 md:border-l md:border-t-0">
              {active && <div className="mb-3 font-display font-bold uppercase text-strong">{fmt(`${active.date}T12:00:00Z`, { weekday: "short", day: "2-digit", month: "2-digit" })}</div>}
              <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto md:grid-cols-1">
                {active?.slots.map((s) => {
                  const on = s.start === value;
                  return (
                    <button key={s.start} type="button" aria-pressed={on} onClick={() => onChange(on ? "" : s.start)}
                      className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-sm border font-mono text-sm tabular-nums transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-card hover:border-primary")}>
                      {!on && <span className="size-1.5 rounded-full bg-success" />}{s.time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      {value && <p className="border-t px-4 py-3 text-sm text-strong">{en ? "Selected" : "Gewählt"}: {fmt(value, { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>}
    </div>
  );
}
