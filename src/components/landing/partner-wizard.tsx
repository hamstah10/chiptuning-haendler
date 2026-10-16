import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Calendar, Check, Circle, CircleDot, Mail, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/format";
import { leadSchema, submitLead } from "@/lib/leads.functions";
import type { Content } from "@/lib/content";

type Fields = Content["wizard"]["fields"];
type OptionKey = keyof Content["wizard"]["options"];

function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="label-caps text-xs text-strong">
        {label}
      </Label>
      <Input id={id} type={type} placeholder={placeholder} value={value} maxLength={255} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-sm bg-sunken" />
    </div>
  );
}

function SelectField({
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

function CheckField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5 rounded-[4px]" />
      <Label htmlFor={id} className="text-sm font-normal leading-relaxed text-foreground">
        {label}
      </Label>
    </div>
  );
}

export function PartnerWizard({ c }: { c: Content }) {
  const t = c.wizard;
  const f: Fields = t.fields;
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "invalid">("idle");
  const [pkg, setPkg] = useState("pro");
  const [text, setText] = useState({ company: "", contactName: "", email: "", phone: "", street: "", city: "", vat: "" });
  const [sel, setSel] = useState<Record<OptionKey, string>>(() => {
    const entries = Object.entries(t.options).map(([k, v]) => [k, v[0]]);
    return Object.fromEntries(entries) as Record<OptionKey, string>;
  });
  const [checks, setChecks] = useState({ tradeProof: false, remote: false, commercial: false, privacy: false, newsletter: false });

  const setT = (k: keyof typeof text) => (v: string) => setText((s) => ({ ...s, [k]: v }));
  const setS = (k: OptionKey) => (v: string) => setSel((s) => ({ ...s, [k]: v }));
  const setC = (k: keyof typeof checks) => (v: boolean) => setChecks((s) => ({ ...s, [k]: v }));

  const buildLead = () => ({
    source: "wizard" as const,
    locale: c.locale,
    company: text.company,
    contactName: text.contactName,
    email: text.email,
    phone: text.phone,
    details: {
      street: text.street,
      city: text.city,
      vat: text.vat,
      ...sel,
      package: pkg,
      tradeProof: String(checks.tradeProof),
      remote: String(checks.remote),
      commercial: String(checks.commercial),
      newsletter: String(checks.newsletter),
    },
  });

  const next = () => {
    if (step === 0 && !leadSchema.safeParse(buildLead()).success) {
      setStatus("invalid");
      return;
    }
    setStatus("idle");
    setStep((s) => s + 1);
  };

  const submit = async () => {
    const lead = buildLead();
    if (!checks.privacy || !leadSchema.safeParse(lead).success) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      await submitLead({ data: lead });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-md border bg-card px-6 py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary bg-primary-soft">
          <Check className="size-7 text-primary" />
        </div>
        <h3 className="mt-5 text-3xl">{t.done.title}</h3>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">{t.done.text}</p>
        <div className="mx-auto mt-6 grid max-w-md gap-2.5 text-left">
          {t.done.items.map((item, i) => {
            const Icon = [Mail, PhoneCall, Calendar][i] ?? Check;
            return (
              <div key={item} className="flex items-center gap-2.5 rounded-sm border px-3.5 py-3 text-sm">
                <Icon className="size-4 text-primary" />
                {item}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-4 gap-2.5">
        {t.steps.map((s, i) => {
          const active = i <= step;
          return (
            <div key={s} className="grid gap-2">
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
                <span className={cn("label-caps hidden text-xs sm:inline", active ? "text-strong" : "text-faint")}>{s}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-md border bg-card p-5 md:p-7">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <h3 className="text-2xl">{t.steps[step]}</h3>

            {step === 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <TextField id="w-company" label={f.company} placeholder={f.companyPh} value={text.company} onChange={setT("company")} />
                <TextField id="w-contact" label={f.contactName} placeholder={f.contactNamePh} value={text.contactName} onChange={setT("contactName")} />
                <TextField id="w-email" type="email" label={f.email} placeholder={f.emailPh} value={text.email} onChange={setT("email")} />
                <TextField id="w-phone" type="tel" label={f.phone} placeholder={f.phonePh} value={text.phone} onChange={setT("phone")} />
                <TextField id="w-street" label={f.street} placeholder={f.streetPh} value={text.street} onChange={setT("street")} />
                <TextField id="w-city" label={f.city} placeholder={f.cityPh} value={text.city} onChange={setT("city")} />
                <SelectField id="w-country" label={f.country} options={t.options.country} value={sel.country} onChange={setS("country")} />
                <TextField id="w-vat" label={f.vat} placeholder={f.vatPh} value={text.vat} onChange={setT("vat")} />
              </div>
            )}

            {step === 1 && (
              <div className="mt-5 grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="w-device" label={f.device} options={t.options.device} value={sel.device} onChange={setS("device")} />
                  <SelectField id="w-type" label={f.businessType} options={t.options.businessType} value={sel.businessType} onChange={setS("businessType")} />
                  <SelectField id="w-focus" label={f.focus} options={t.options.focus} value={sel.focus} onChange={setS("focus")} />
                  <SelectField id="w-dyno" label={f.dyno} options={t.options.dyno} value={sel.dyno} onChange={setS("dyno")} />
                </div>
                <div className="grid gap-3">
                  <CheckField id="w-proof" label={f.tradeProof} checked={checks.tradeProof} onChange={setC("tradeProof")} />
                  <CheckField id="w-remote" label={f.remote} checked={checks.remote} onChange={setC("remote")} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="w-jobs" label={f.jobs} options={t.options.jobs} value={sel.jobs} onChange={setS("jobs")} />
                  <SelectField id="w-start" label={f.start} options={t.options.start} value={sel.start} onChange={setS("start")} />
                </div>
                <div>
                  <div className="label-caps mb-2.5 text-xs text-strong">{f.pkg}</div>
                  <div className="grid gap-2.5">
                    {c.packages.map((p) => {
                      const on = pkg === p.id;
                      const Icon = on ? CircleDot : Circle;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPkg(p.id)}
                          className={cn("flex w-full items-center gap-3.5 rounded-sm border px-4 py-3.5 text-left transition-colors", on ? "border-primary bg-primary-soft" : "hover:border-border-strong")}
                        >
                          <Icon className={cn("size-[18px] shrink-0", on ? "text-primary" : "text-faint")} />
                          <span className="flex-1">
                            <span className="block font-display font-bold uppercase text-strong">{p.n}</span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">{p.d}</span>
                          </span>
                          <span className="whitespace-nowrap font-mono text-sm text-strong">
                            {formatEuro(p.monthly, c.locale)} {c.calculator.perMonth}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 grid gap-4">
                <p className="max-w-2xl leading-relaxed text-muted-foreground">{f.finalText}</p>
                <CheckField id="w-commercial" label={f.commercial} checked={checks.commercial} onChange={setC("commercial")} />
                <CheckField id="w-privacy" label={f.privacy} checked={checks.privacy} onChange={setC("privacy")} />
                <CheckField id="w-news" label={f.newsletter} checked={checks.newsletter} onChange={setC("newsletter")} />
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
          {step < 3 ? (
            <Button onClick={next} size="lg" className="label-caps rounded-sm">
              {t.next}
              <ArrowRight />
            </Button>
          ) : (
            <Button onClick={submit} size="lg" disabled={status === "sending"} className="label-caps rounded-sm">
              {status === "sending" ? t.sending : t.submit}
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
