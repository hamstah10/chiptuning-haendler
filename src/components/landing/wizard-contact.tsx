import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { fetchWizardAppointments, type WizardConfig, type WizardContact, type WizardDay, type WizardQuestion } from "@/lib/partner-wizard-api";

const fieldClass = "h-11 w-full rounded-sm border border-input bg-sunken px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const optTitle = (o: WizardQuestion["options"][number]) => o.title ?? o.name ?? o.text ?? o.value ?? "";

export function contactMissing(questions: WizardQuestion[], v: WizardContact): boolean {
  return questions.some((q) => {
    const x = v[q.answerKey];
    if (q.fieldType === "email" && x && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x))) return true;
    if (!q.required) return false;
    if (q.fieldType === "checkbox") return q.options.length ? !(Array.isArray(x) && x.length) : x !== true;
    return !String(x ?? "").trim();
  });
}

function Field({ q, value, onChange }: { q: WizardQuestion; value: WizardContact[string] | undefined; onChange: (v: WizardContact[string]) => void }) {
  const id = `dct-${q.answerKey}`;
  const label = <>{q.title}{q.required ? " *" : ""}</>;
  if (q.fieldType === "checkbox" && !q.options.length) {
    return (
      <div className="flex items-start gap-3 sm:col-span-2">
        <Checkbox id={id} checked={value === true} onCheckedChange={(c) => onChange(c === true)} className="mt-0.5 rounded-[4px]" />
        <Label htmlFor={id} className="text-sm font-normal leading-relaxed text-foreground">{label}</Label>
      </div>
    );
  }
  if (q.fieldType === "checkbox" || q.fieldType === "radio") {
    const multi = q.fieldType === "checkbox";
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset className="grid gap-2 sm:col-span-2">
        <legend className="label-caps mb-1.5 text-xs text-strong">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {q.options.map((o) => {
            const v = o.value ?? String(o.id);
            const on = multi ? list.includes(v) : value === v;
            return (
              <button key={v} type="button" aria-pressed={on}
                onClick={() => onChange(multi ? (on ? list.filter((x) => x !== v) : [...list, v]) : on ? "" : v)}
                className={cn("rounded-sm border px-3.5 py-2 text-sm transition-colors", on ? "border-primary bg-primary-soft text-strong" : "bg-sunken hover:border-border-strong")}>
                {optTitle(o)}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }
  return (
    <div className={cn("grid gap-1.5", q.fieldType === "textarea" && "sm:col-span-2")}>
      <Label htmlFor={id} className="label-caps text-xs text-strong">{label}</Label>
      {q.fieldType === "select" ? (
        <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
          <option value="">Bitte wählen</option>
          {q.options.map((o) => <option key={o.value ?? o.id} value={o.value ?? String(o.id)}>{optTitle(o)}</option>)}
        </select>
      ) : q.fieldType === "textarea" ? (
        <textarea id={id} rows={4} maxLength={2000} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={cn(fieldClass, "h-auto py-2")} />
      ) : (
        <Input id={id} type={q.fieldType === "email" ? "email" : q.answerKey === "phone" ? "tel" : "text"} maxLength={255} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-sm bg-sunken" />
      )}
    </div>
  );
}

export function WizardContactFields({ questions, values, onChange }: { questions: WizardQuestion[]; values: WizardContact; onChange: (key: string, v: WizardContact[string]) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {questions.map((q) => <Field key={q.answerKey} q={q} value={values[q.answerKey]} onChange={(v) => onChange(q.answerKey, v)} />)}
    </div>
  );
}

export function AppointmentPicker({ settings, locale, value, onChange }: { settings: NonNullable<WizardConfig["appointment"]>; locale: "de" | "en"; value: string; onChange: (start: string) => void }) {
  const [days, setDays] = useState<WizardDay[] | null>(null);
  const [error, setError] = useState(false);
  const [day, setDay] = useState("");
  useEffect(() => {
    let on = true;
    fetchWizardAppointments().then((d) => { if (on) { setDays(d); setDay(d[0]?.date ?? ""); } }).catch(() => on && setError(true));
    return () => { on = false; };
  }, []);
  const tag = locale === "en" ? "en-GB" : "de-DE";
  const active = days?.find((d) => d.date === day);
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag, { timeZone: settings.timezone, ...o }).format(new Date(iso));
  return (
    <div className="grid gap-3 rounded-sm border bg-sunken p-4">
      <div>
        <div className="label-caps text-xs text-strong">{settings.title}{settings.required ? " *" : locale === "en" ? " (optional)" : " (optional)"}</div>
        <p className="mt-1 text-xs text-muted-foreground">{settings.durationMinutes} {locale === "en" ? "minutes · times in" : "Minuten · Zeiten in"} {settings.timezone.replace("_", " ")}</p>
      </div>
      {error ? <p className="text-sm text-destructive">{locale === "en" ? "Appointments could not be loaded." : "Termine konnten nicht geladen werden."}</p>
        : !days ? <Loader2 className="size-5 animate-spin text-primary" />
        : !days.length ? <p className="text-sm text-muted-foreground">{locale === "en" ? "No free appointments." : "Keine freien Termine."}</p>
        : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => {
                const on = d.date === day;
                const iso = `${d.date}T12:00:00Z`;
                return (
                  <button key={d.date} type="button" onClick={() => setDay(d.date)} aria-pressed={on}
                    className={cn("grid min-w-16 shrink-0 gap-0.5 rounded-sm border px-3 py-2 text-center", on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-border-strong")}>
                    <small className="text-[11px] uppercase">{fmt(iso, { weekday: "short" })}</small>
                    <b className="font-mono text-sm tabular-nums">{fmt(iso, { day: "2-digit", month: "2-digit" })}</b>
                  </button>
                );
              })}
            </div>
            {active && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {active.slots.map((s) => {
                  const on = s.start === value;
                  return (
                    <button key={s.start} type="button" aria-pressed={on} onClick={() => onChange(on ? "" : s.start)}
                      className={cn("rounded-sm border px-2 py-2 font-mono text-sm tabular-nums", on ? "border-primary bg-primary-soft text-strong" : "bg-card hover:border-border-strong")}>
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
            {value && <p className="text-sm text-strong">{locale === "en" ? "Selected" : "Gewählt"}: {fmt(value, { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>}
          </>
        )}
    </div>
  );
}
