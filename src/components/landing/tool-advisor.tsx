import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Cpu, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recommendTool, type Budget, type Focus, type Method } from "@/lib/tool-advisor";
import type { Content } from "@/lib/content";

interface Choice<T extends string> {
  value: T;
  label: string;
  text?: string;
}

function Options<T extends string>({ title, choices, onPick }: { title: string; choices: Choice<T>[]; onPick: (v: T) => void }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold text-strong">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {choices.map((ch) => (
          <button
            key={ch.value}
            type="button"
            onClick={() => onPick(ch.value)}
            className="rounded-sm border bg-background p-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-display font-semibold text-strong">{ch.label}</span>
            {ch.text && <span className="mt-1 block text-sm text-muted-foreground">{ch.text}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ToolAdvisor({ c }: { c: Content }) {
  const t = c.advisor;
  const [focus, setFocus] = useState<Focus | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const step = focus === null ? 0 : method === null ? 1 : budget === null ? 2 : 3;
  const result = focus && method && budget ? recommendTool({ focus, method, budget }) : null;

  const back = () => {
    if (step === 1) setFocus(null);
    if (step === 2) setMethod(null);
  };
  const restart = () => {
    setFocus(null);
    setMethod(null);
    setBudget(null);
  };

  return (
    <div className="rounded-md border bg-card p-5 md:p-8">
      <ol className="mb-6 flex gap-2">
        {t.steps.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={cn("h-0.5", i < step ? "bg-primary" : "bg-border")} />
            <span className={cn("label-caps mt-2 block text-xs", i <= step ? "text-strong" : "text-muted-foreground")}>{s}</span>
          </li>
        ))}
      </ol>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {step === 0 && (
          <Options<Focus>
            title={t.focus.title}
            onPick={setFocus}
            choices={[
              { value: "car", label: t.focus.car },
              { value: "van", label: t.focus.van },
              { value: "truck", label: t.focus.truck },
              { value: "bike", label: t.focus.bike },
            ]}
          />
        )}
        {step === 1 && (
          <Options<Method>
            title={t.method.title}
            onPick={setMethod}
            choices={[
              { value: "obd", label: t.method.obd, text: t.method.obdText },
              { value: "bench", label: t.method.bench, text: t.method.benchText },
            ]}
          />
        )}
        {step === 2 && (
          <Options<Budget>
            title={t.budget.title}
            onPick={setBudget}
            choices={[
              { value: "low", label: t.budget.low },
              { value: "mid", label: t.budget.mid },
              { value: "high", label: t.budget.high },
            ]}
          />
        )}
        {result && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-sm border border-primary bg-background p-5">
              <span className="kicker">{t.resultKicker}</span>
              <h3 className="mt-2 font-display text-xl font-bold text-strong">{t.modes[result.mode].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.modes[result.mode].text}</p>
            </div>
            <div className="rounded-sm border bg-background p-5">
              <Cpu className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-2 font-display text-xl font-bold text-strong">{t.tools[result.tool].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.tools[result.tool].text}</p>
            </div>
            <p className="text-xs text-muted-foreground md:col-span-2">{t.note}</p>
          </div>
        )}
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-3">
        {(step === 1 || step === 2) && (
          <Button variant="outline" onClick={back}>
            {t.back}
          </Button>
        )}
        {result && (
          <>
            <Button asChild>
              <a href="#anmeldung">
                {t.cta} <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="h-4 w-4" /> {t.restart}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
