import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/format";

export interface FieldOption { value: string; title: string; text?: string | null; icon?: string | null }

const tick = (on: boolean, small = false) => (
  <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full border", small ? "size-4" : "size-5", on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong text-transparent")}>
    <Check className={small ? "size-2.5" : "size-3"} />
  </span>
);

const tileBase = "border bg-sunken transition-colors hover:border-border-strong active:translate-y-px";
const tileOn = "border-primary bg-primary-soft hover:border-primary";

/** Large single-choice cards with an index marker and description. */
export function ChoiceCards({ options, isOn, onToggle }: { options: FieldOption[]; isOn: (v: string) => boolean; onToggle: (v: string) => void }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((o, i) => {
        const on = isOn(o.value);
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onToggle(o.value)}
            className={cn("flex w-full items-start gap-3.5 rounded-sm px-4 py-3.5 text-left", tileBase, on && tileOn)}>
            <span className={cn("font-mono text-xs tabular-nums", on ? "text-primary" : "text-faint")}>{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1">
              <span className="block font-display font-bold uppercase leading-tight text-strong">{o.title}</span>
              {o.text && <span className="mt-1 block text-sm text-muted-foreground">{o.text}</span>}
            </span>
            {tick(on)}
          </button>
        );
      })}
    </div>
  );
}

/** Compact horizontal buttons (vehicle types): icon left, label beside it, multi-select with counter. */
export function ImageCards({ options, isOn, onToggle, countLabel }: { options: FieldOption[]; isOn: (v: string) => boolean; onToggle: (v: string) => void; countLabel: (n: number) => string }) {
  const count = options.filter((o) => isOn(o.value)).length;
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const on = isOn(o.value);
          return (
            <button key={o.value} type="button" aria-pressed={on} onClick={() => onToggle(o.value)}
              className={cn("flex h-12 w-full items-center gap-3 rounded-sm px-3 text-left", tileBase, on && tileOn)}>
              {o.icon && <img src={o.icon} alt="" loading="lazy" className="size-8 shrink-0 object-contain" width={32} height={32} />}
              <span className="flex-1 truncate font-display text-sm font-bold uppercase leading-tight text-strong">{o.title}</span>
              {tick(on, true)}
            </button>
          );
        })}
      </div>
      <p className="font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">{countLabel(count)}</p>
    </div>
  );
}

/** Multi-select cards with a tick marker and the option's description text, optionally split into labelled groups. */
export function CheckCards({ options, isOn, onToggle, onAll, onReset, allLabel, resetLabel, sections }: { options: FieldOption[]; isOn: (v: string) => boolean; onToggle: (v: string) => void; onAll?: (() => void) | undefined; onReset?: (() => void) | undefined; allLabel?: string; resetLabel?: string; sections?: { label: string; options: FieldOption[] }[] | undefined }) {
  const groups = sections && sections.length > 1 ? sections : [{ label: null, options }];
  const card = (o: FieldOption) => {
    const on = isOn(o.value);
    return (
      <button key={o.value} type="button" aria-pressed={on} onClick={() => onToggle(o.value)}
        className={cn("flex w-full items-start gap-3.5 rounded-sm px-4 py-3.5 text-left", tileBase, on && tileOn)}>
        <span className="flex-1">
          <span className="block font-display font-bold uppercase leading-tight text-strong">{o.title}</span>
          {o.text && <span className="mt-1 block text-sm text-muted-foreground">{o.text}</span>}
        </span>
        {tick(on)}
      </button>
    );
  };
  return (
    <div className="grid gap-4">
      {groups.map((g, i) => (
        <div key={g.label ?? i} className="grid gap-2.5">
          {g.label && <p className="label-caps text-xs text-muted-foreground">{g.label}</p>}
          <div className="grid gap-2.5 sm:grid-cols-2">{g.options.map(card)}</div>
        </div>
      ))}
      {onAll && onReset && options.length > 5 && (
        <div className="flex gap-4 text-xs">
          <button type="button" onClick={onAll} className="label-caps text-primary hover:underline">{allLabel}</button>
          <button type="button" onClick={onReset} className="label-caps text-muted-foreground hover:text-strong">{resetLabel}</button>
        </div>
      )}
    </div>
  );
}

/** Manufacturer logo tiles, single choice, plus an explicit "no tool yet" tile. */
export function LogoTiles({ options, isOn, onToggle, noneLabel, noneOn, onNone }: { options: FieldOption[]; isOn: (v: string) => boolean; onToggle: (v: string) => void; noneLabel: string; noneOn: boolean; onNone: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((o) => {
        const on = isOn(o.value);
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onToggle(o.value)} title={o.text ?? undefined}
            className={cn("relative grid h-24 place-items-center gap-1 rounded-sm px-3 py-3", tileBase, on && tileOn)}>
            <span className="absolute right-2 top-2">{tick(on, true)}</span>
            {o.icon ? <img src={o.icon} alt={o.title} loading="lazy" className="max-h-9 max-w-[80%] object-contain" /> : null}
            <span className="label-caps text-[11px] text-muted-foreground">{o.title}</span>
          </button>
        );
      })}
      <button type="button" role="radio" aria-checked={noneOn} onClick={onNone}
        className={cn("relative grid h-24 place-items-center rounded-sm border-dashed px-3 py-3", tileBase, noneOn && tileOn)}>
        <span className="absolute right-2 top-2">{tick(noneOn, true)}</span>
        <span className="label-caps text-xs text-strong">{noneLabel}</span>
      </button>
    </div>
  );
}

/** Compact toggle chips for many answers, with select-all / reset. */
export function ChipGroup({ options, isOn, onToggle, onAll, onReset, allLabel, resetLabel }: { options: FieldOption[]; isOn: (v: string) => boolean; onToggle: (v: string) => void; onAll?: (() => void) | undefined; onReset?: (() => void) | undefined; allLabel?: string; resetLabel?: string }) {
  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = isOn(o.value);
          return (
            <button key={o.value} type="button" aria-pressed={on} onClick={() => onToggle(o.value)} title={o.text ?? undefined}
              className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors active:translate-y-px", on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-sunken text-foreground hover:border-primary")}>
              {on && <Check className="size-3.5" />}
              {o.title}
            </button>
          );
        })}
      </div>
      {onAll && onReset && options.length > 5 && (
        <div className="flex gap-4 text-xs">
          <button type="button" onClick={onAll} className="label-caps text-primary hover:underline">{allLabel}</button>
          <button type="button" onClick={onReset} className="label-caps text-muted-foreground hover:text-strong">{resetLabel}</button>
        </div>
      )}
    </div>
  );
}

/** Side-by-side segmented switch for short single-choice answers. */
export function SegmentedControl({ options, value, onChange, label }: { options: FieldOption[]; value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full flex-col overflow-hidden rounded-sm border border-border-strong bg-sunken sm:inline-flex sm:w-auto sm:flex-row">
      {options.map((o, i) => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(on ? "" : o.value)}
            className={cn("h-10 px-4 text-sm transition-colors", i > 0 && "border-t border-border-strong sm:border-l sm:border-t-0", on ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-card")}>
            {o.title}
          </button>
        );
      })}
    </div>
  );
}
