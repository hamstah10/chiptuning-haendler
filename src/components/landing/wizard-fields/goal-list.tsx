import { Briefcase, Check, Rocket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldOption } from "./index";

const ICONS = [Rocket, Briefcase, Zap];
/** Portal answer values in list order; used to look up the corrected labels. */
const GOAL_VALUES = ["start", "workshop", "active"];
const COPY = {
  de: [
    ["Neu starten", "Ich möchte in das Thema Chiptuning / Verbrauchsoptimierung & Optionen einsteigen."],
    ["Portfolio erweitern z.B. als Werkstatt, Aufbereiter oder Autohändler", "Ich habe regelmäßigen Kundenkontakt und möchte Chiptuning und Deaktivierungen anbieten."],
    ["Aktiver Tuner", "Ich arbeite regelmäßig an Fahrzeugen."],
  ],
  en: [
    ["Start fresh", "I want to get into chip tuning / fuel optimisation & options."],
    ["Expand portfolio e.g. as a workshop, detailer or car dealer", "I have regular customer contact and want to offer chip tuning and deactivations."],
    ["Active tuner", "I work on vehicles regularly."],
  ],
} as const;

/** Corrected goal title for a portal answer value (the portal text contains typos). */
export function goalTitle(value: string, locale: "de" | "en"): string | undefined {
  const i = GOAL_VALUES.indexOf(value);
  return i === -1 ? undefined : COPY[locale][i][0];
}

/** Multi-select goal list: numbered rows with icon box, text and square checkbox. */
export function GoalList({ options, isOn, onToggle, locale }: { options: FieldOption[]; isOn: (v: string) => boolean; onToggle: (v: string) => void; locale: "de" | "en" }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o, i) => {
        const on = isOn(o.value);
        const Icon = ICONS[i] ?? Rocket;
        const copy = options.length === 3 ? COPY[locale][i] : undefined;
        return (
          <button key={o.value} type="button" role="checkbox" aria-checked={on} onClick={() => onToggle(o.value)}
            className={cn(
              "flex w-full items-center gap-4 rounded-sm border-[1.5px] px-[18px] py-4 text-left transition-colors duration-[160ms] ease-out",
              on ? "border-primary bg-[#f1dcdd] dark:bg-primary/10" : "border-[#dcdcdc] bg-card hover:border-border-strong dark:border-[#2a2a2a] dark:bg-[#1c1c1c]",
            )}>
            <span className="w-[18px] shrink-0 font-mono text-[11px] tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-sm", on ? "bg-primary text-primary-foreground" : "bg-[#f1f1f1] text-muted-foreground dark:bg-[#232323] dark:text-[#a3a3a3]")}>
              <Icon size={20} strokeWidth={1.8} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold uppercase leading-tight text-strong">{copy?.[0] ?? o.title}</span>
              {(copy?.[1] ?? o.text) && <span className="mt-1 block text-[13.5px] leading-[1.4] text-muted-foreground dark:text-[#a3a3a3]">{copy?.[1] ?? o.text}</span>}
            </span>
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-sm border-[1.5px]", on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-card")}>
              {on && <Check size={14} strokeWidth={3} aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
