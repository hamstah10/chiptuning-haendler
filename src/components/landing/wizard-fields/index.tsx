import { useState } from "react";
import { Check, Gauge, Laptop, Sprout, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/format";

export interface FieldOption { value: string; title: string; text?: string | null; icon?: string | null; svg?: string | undefined }

/** Portal option picture; hidden when the file cannot load, recoloured in dark mode. */
function OptionIcon({ src, className }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={32}
      height={32}
      onError={() => setFailed(true)}
      className={cn("shrink-0 object-contain dark:brightness-0 dark:invert", className)}
    />
  );
}

/** Local icon markup; takes the colour of the surrounding text. */
function InlineIcon({ svg, className }: { svg: string; className?: string }) {
  return <span aria-hidden="true" className={cn("shrink-0", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}

const tick = (on: boolean, small = false) => (
  <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full border", small ? "size-4" : "size-5", on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong text-transparent")}>
    <Check className={small ? "size-2.5" : "size-3"} />
  </span>
);

const tileBase = "border border-border-strong bg-sunken transition-colors hover:border-primary/60 active:translate-y-px";
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

const STEP_SLIDER_ICONS = [Sprout, Laptop, Wrench, Gauge];

/** Single choice as a draggable step slider: dot, icon and title per stage, description box for the chosen stage. */
export function StepSlider({ options, value, onChange, label }: { options: FieldOption[]; value: string; onChange: (v: string) => void; label?: string }) {
  const chosen = options.findIndex((o) => o.value === value);
  const pos = chosen >= 0 ? chosen : 0;
  const last = Math.max(options.length - 1, 1);
  const current = chosen >= 0 ? options[chosen] : undefined;
  const cols = { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` };
  return (
    <div>
      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-3 h-0.5 -translate-y-1/2 rounded-full bg-[#cfcfcf] dark:bg-[#333]" aria-hidden />
        <div className="absolute left-[12.5%] top-3 h-0.5 -translate-y-1/2 rounded-full bg-[#bd1e23] transition-[width] duration-[220ms] ease-out" style={{ width: `${(pos / last) * 75}%` }} aria-hidden />
        <input
          type="range" min={0} max={last} step={1} value={pos} aria-label={label}
          onChange={(e) => { const o = options[Number(e.target.value)]; if (o) onChange(o.value); }}
          className="absolute top-0 z-10 h-6 cursor-grab opacity-0 active:cursor-grabbing"
          style={{ left: "calc(12.5% - 14px)", width: "calc(75% + 28px)" }}
        />
        <div role="radiogroup" aria-label={label} className="relative grid" style={cols}>
          {options.map((o, i) => {
            const on = i === chosen;
            const passed = chosen >= 0 && i < chosen;
            return (
              <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)} className="flex h-6 items-center justify-center">
                <span className={cn(
                  "rounded-full transition-all duration-[180ms] ease-out",
                  on
                    ? "size-6 border-2 border-[#bd1e23] bg-[#bd1e23] shadow-[0_0_0_6px_rgba(189,30,35,0.22)]"
                    : passed
                      ? "size-4 border-2 border-[#bd1e23] bg-[#bd1e23]"
                      : "size-4 border-2 border-[#cfcfcf] bg-white dark:border-[#333] dark:bg-[#232323]",
                )} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-[18px] grid" style={cols}>
        {options.map((o, i) => {
          const Icon = STEP_SLIDER_ICONS[i] ?? Gauge;
          const on = i === chosen;
          const passed = chosen >= 0 && i < chosen;
          return (
            <button key={o.value} type="button" onClick={() => onChange(o.value)} className="flex flex-col items-center gap-1.5 px-1 text-center">
              <Icon strokeWidth={1.8} className={cn("size-7", on ? "text-[#1a1a1a] dark:text-white" : passed ? "text-[#bd1e23]" : "text-[#999]")} />
              <span className={cn("font-display text-[13px] font-bold uppercase leading-tight", on ? "text-[#1a1a1a] dark:text-white" : passed ? "text-[#333] dark:text-[#ededed]" : "text-[#888]")}>{o.title}</span>
            </button>
          );
        })}
      </div>
      {current && (
        <div className="mt-7 flex gap-4 rounded-[4px] border border-[#dcdcdc] bg-white px-5 py-[18px] dark:border-[#333] dark:bg-[#1c1c1c]">
          <span className="font-mono text-xs tabular-nums text-[#bd1e23]">{String(chosen + 1).padStart(2, "0")}</span>
          <span>
            <span className="block font-display text-[15px] font-bold uppercase text-[#1a1a1a] dark:text-white">{current.title}</span>
            {current.text && <span className="mt-1 block text-sm leading-[1.45] text-[#555] dark:text-[#ededed]/80">{current.text}</span>}
          </span>
        </div>
      )}
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
        className={cn("flex w-full items-start gap-2.5 rounded-sm px-3.5 py-3 text-left", tileBase, on && tileOn)}>
        {o.svg ? <InlineIcon svg={o.svg} className="mt-0.5 size-8 text-primary" /> : o.icon ? <OptionIcon src={o.icon} className="mt-0.5 size-8" /> : null}
        <span className="flex-1">
          <span className="block font-display text-sm font-bold uppercase leading-tight text-strong">{o.title}</span>
          {o.text && <span className="mt-1 block text-xs leading-snug text-muted-foreground">{o.text}</span>}
        </span>
        {tick(on, true)}
      </button>
    );
  };
  return (
    <div className="grid gap-4">
      {groups.map((g, i) => (
        <div key={g.label ?? i} className="grid gap-2.5">
          {g.label && <p className="label-caps text-xs text-muted-foreground">{g.label}</p>}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{g.options.map(card)}</div>
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
      <button type="button" role="radio" aria-checked={noneOn} onClick={onNone}
        className={cn("relative grid h-24 place-items-center rounded-sm border-dashed px-3 py-3", tileBase, noneOn && tileOn)}>
        <span className="absolute right-2 top-2">{tick(noneOn, true)}</span>
        <span className="label-caps text-xs text-strong">{noneLabel}</span>
      </button>
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

/** A recommended tool as shown in the sidebar: name, optional note, picture and price. */
export interface ToolItem { key: string; title: string; text?: string | null; image?: string | null; price?: string | number | null }

/**
 * Tools with their picture. One tool renders as a prominent card, several as compact list rows.
 */
export function ToolList({ tools, locale, label }: { tools: ToolItem[]; locale: "de" | "en"; label?: string }) {
  if (tools.length === 0) return null;
  const single = tools.length === 1;
  return (
    <div className="grid gap-2">
      {label && <div className="label-caps text-[11px] text-muted-foreground">{label}</div>}
      {tools.map((t) => (
        <div key={t.key} className={cn("flex min-w-0 items-center gap-3 rounded-sm border border-border-strong bg-card", single ? "px-3.5 py-3" : "px-2.5 py-2")}>
          {t.image ? (
            <img src={t.image} alt="" loading="lazy" width={single ? 48 : 32} height={single ? 48 : 32}
              className={cn("shrink-0 object-contain", single ? "size-12" : "size-8")} />
          ) : (
            <span className={cn("shrink-0 rounded-sm border border-dashed border-border-strong", single ? "size-12" : "size-8")} aria-hidden />
          )}
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate font-display font-bold uppercase leading-tight text-strong", single ? "text-sm" : "text-xs")}>{t.title}</span>
            {single && t.text && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{t.text}</span>}
          </span>
          {t.price != null && t.price !== "" && (
            <span className="whitespace-nowrap font-mono text-xs tabular-nums text-strong">{formatEuro(Number(t.price), locale)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
