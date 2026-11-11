import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, MotionConfig, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  Calculator,
  Check,
  Clock,
  Cpu,
  Download,
  Headphones,
  Layers,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { CountUp, Reveal, ScrollProgress } from "./motion";
import { Configurator } from "./configurator";
import { PartnerWizard } from "./partner-wizard";
import { PartnerWizardDct } from "./partner-wizard-dct";
import { EarningsCalculator } from "./earnings-calculator";
import { FileServiceTeaser } from "./file-service-teaser";
import { DynoCompare } from "./dyno-compare";
import { StartPlan } from "./start-plan";
import { ToolAdvisor } from "./tool-advisor";
import { VehicleCheck } from "./vehicle-check";
import { LegalLinks } from "./legal-links";
import { Logo } from "./logo";
import { LanguageSelector } from "./language-selector";
import { GoogleReviews } from "./google-reviews";
import { MixedHero } from "./mixed-hero";
import { TuningDrive } from "./tuning-drive";

import type { Content } from "@/lib/content";

/** Section ids in chapter order (01–09). */
const CHAPTER_IDS = [
  "problem",
  "loesung",
  "anmeldung",
  "ablauf",
  "verdienst",
  "konfigurator",
  "startplan",
  "vertrauen",
  "faq",
];

/** Chapters that sit on a dark surface in the mixed composition. */
const MIXED_DARK_CHAPTERS = new Set(["loesung", "ablauf", "tool-berater", "vertrauen"]);

export { Logo } from "./logo";

export function ThemeToggle({ c }: { c: Content }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(localStorage.getItem("tf-theme-light-design") === "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-sm"
      aria-label={dark ? c.nav.themeLight : c.nav.themeDark}
      onClick={() => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("tf-theme-light-design", next ? "dark" : "light");
      }}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}

function Header({ c, mixed = false }: { c: Content; mixed?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-5 md:pl-20">
        <a href="#top" className="min-w-0 shrink" aria-label="Tuningfiles-download.com">
          <Logo />
        </a>
        <nav aria-label={c.chapterLabel} className="flex shrink-0 items-center gap-1 sm:gap-2">
          <a
            href="#anmeldung"
            className="label-caps hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            {c.nav.wizard}
          </a>
          <LanguageSelector locale={c.locale} />
          {!mixed && <ThemeToggle c={c} />}
          <Button asChild className="label-caps hidden rounded-sm sm:inline-flex">
            <a href="#anmeldung">
              {c.nav.cta}
              <ArrowRight />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function ChapterRail({ c, mixed = false }: { c: Content; mixed?: boolean }) {
  const [activeId, setActiveId] = useState("");
  const [onDrive, setOnDrive] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const els = [...CHAPTER_IDS, "drive", "top"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const updateChapter = () => {
      const focusLine = 64 + (window.innerHeight - 64) * 0.45;
      const current = els.find((el) => {
        const bounds = el.getBoundingClientRect();
        return bounds.top <= focusLine && bounds.bottom > focusLine;
      });
      setOnDrive(current?.id === "drive");
      if (current && current.id !== "drive") setActiveId(current.id);
    };
    const observer = new IntersectionObserver(updateChapter, {
      rootMargin: "-45% 0px -50% 0px",
    });
    const resizeObserver = new ResizeObserver(updateChapter);
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updateChapter();
      });
    };
    let frame: number | null = null;
    els.forEach((el) => {
      observer.observe(el);
      resizeObserver.observe(el);
    });
    updateChapter();
    window.addEventListener("resize", updateChapter);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateChapter);
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  // Some parts of the mixed composition sit on a dark surface.
  const active = CHAPTER_IDS.indexOf(activeId === "top" ? (CHAPTER_IDS[0] ?? "") : activeId);

  const onDark = mixed && (MIXED_DARK_CHAPTERS.has(activeId) || activeId === "top");

  return (
    <nav
      aria-label={c.chapterLabel}
      className={cn(
        "group/rail fixed left-2 top-1/2 z-40 hidden w-16 -translate-y-1/2 transition-[width,opacity] duration-300 hover:w-40 focus-within:w-40 motion-reduce:transition-none md:block",
        onDrive && "pointer-events-none opacity-0",
      )}
    >
      <ol
        className={cn(
          "grid gap-1 rounded-md border bg-card/95 p-1.5 shadow-xl backdrop-blur-sm transition-colors duration-500 motion-reduce:transition-none",
          onDark && "dark",
        )}
      >
        {CHAPTER_IDS.map((id, i) => {
          const on = i === active;
          return (
            <li key={id}>
              <Button asChild variant="ghost" className="h-auto w-full justify-start rounded-sm px-2 py-2">
              <a
                href={`#${id}`}
                title={c.chapters[i]}
                className="group relative flex items-center gap-2 overflow-hidden"
                aria-label={`${String(i + 1).padStart(2, "0")} ${c.chapters[i]}`}
                aria-current={on ? "step" : undefined}
              >
                <span className="relative flex w-3 shrink-0 justify-start">
                  <span
                    className={cn(
                      "h-px transition-all duration-300",
                      "w-2 bg-border-strong group-hover:w-4",
                    )}
                  />
                  {on && (
                    <motion.span
                      layoutId="active-chapter-line"
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 h-px w-3 bg-primary"
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 180, damping: 26 }
                      }
                    />
                  )}
                </span>

                <span
                  className={cn(
                    "shrink-0 font-mono text-xs transition-colors duration-500 motion-reduce:transition-none",
                    on ? "text-strong" : "text-faint group-hover:text-strong",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={cn("absolute left-12 w-24 whitespace-nowrap text-left text-xs leading-tight opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 motion-reduce:transition-none", on ? "font-semibold text-strong" : "text-muted-foreground group-hover:text-strong")}>
                  {c.chapters[i]}
                </span>
              </a>
              </Button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Section({
  id,
  kicker,
  title,
  children,
  intro,
  className,
}: {
  id: string;
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 border-b", className)}>
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28 md:pl-20">
        <Reveal>
          <span className="kicker">{kicker}</span>
          <h2 className="mt-3 max-w-3xl text-3xl leading-[1.08] md:text-5xl">{title}</h2>
          {intro && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
          )}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function curve(peak: number, max: number) {
  const pts = 48;
  return Array.from({ length: pts }, (_, i) => {
    const x = i / (pts - 1);
    const y = Math.pow(Math.sin(Math.PI * Math.pow(x, 0.78)), 0.9);
    const v = peak * (0.12 + 0.88 * y);
    return `${i ? "L" : "M"}${(x * 100).toFixed(2)},${(100 - (v / max) * 100).toFixed(2)}`;
  }).join(" ");
}

function HeroDyno({ c }: { c: Content }) {
  const base = 150;
  const tuned = 190;
  const max = tuned * 1.15;
  return (
    <div className="rounded-md border bg-card p-5 shadow-xl md:p-6">
      <div className="flex items-center justify-between">
        <span className="label-caps text-xs text-strong">Dyno · PS</span>
        <span className="font-mono text-[11px] uppercase text-faint">{c.dyno.caption}</span>
      </div>
      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-sm border bg-sunken">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {[20, 40, 60, 80].map((y) => (
            <line
              key={`h${y}`}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              className="stroke-border"
              strokeWidth="0.3"
            />
          ))}
          {[20, 40, 60, 80].map((x) => (
            <line
              key={`v${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              className="stroke-border"
              strokeWidth="0.3"
            />
          ))}
          <defs>
            <clipPath id="dyno-base">
              <motion.rect
                x="0"
                y="0"
                height="100"
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
              />
            </clipPath>
            <clipPath id="dyno-tuned">
              <motion.rect
                x="0"
                y="0"
                height="100"
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                transition={{ duration: 1.8, delay: 1, ease: "easeInOut" }}
              />
            </clipPath>
          </defs>
          <path
            d={curve(base, max)}
            fill="none"
            className="stroke-faint"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#dyno-base)"
          />
          <path
            d={curve(tuned, max)}
            fill="none"
            className="stroke-primary"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#dyno-tuned)"
          />
        </svg>
        <div className="absolute left-3 top-3 grid gap-1 font-mono text-[11px] uppercase tracking-wider">
          <span className="text-faint">— — {c.dyno.series}</span>
          <span className="text-primary">—— {c.dyno.tuned}</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase text-faint">{c.dyno.series}</div>
          <div className="font-display text-2xl font-bold text-strong">
            {formatNumber(base, c.locale)} PS
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase text-primary">{c.dyno.tuned}</div>
          <div className="font-display text-2xl font-bold text-primary">
            <CountUp to={tuned} locale={c.locale} suffix=" PS" />
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase text-faint">{c.dyno.gain}</div>
          <div className="font-display text-2xl font-bold text-strong">
            <CountUp
              to={Math.round(((tuned - base) / base) * 100)}
              locale={c.locale}
              prefix="+"
              suffix=" %"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ c }: { c: Content }) {
  return (
    <section id="top" className="relative overflow-hidden border-b">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 md:pt-20 md:pl-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="kicker block"
          >
            {c.hero.kicker}
          </motion.span>
          <h1 className="mt-5 text-[2.4rem] leading-[1.02] sm:text-6xl">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {c.hero.title1}
            </motion.span>
            <motion.span
              className="block text-primary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {c.hero.title2}
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            {c.hero.lead}
          </motion.p>

          <motion.a
            href="#anmeldung"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="group mt-8 flex max-w-xl items-center gap-4 rounded-md border border-l-4 border-l-primary bg-card p-4 transition-colors hover:border-primary"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <UserPlus className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display font-bold uppercase text-strong">
                {c.teaser.title}
              </span>
              <span className="block text-sm text-muted-foreground">{c.teaser.text}</span>
            </span>
            <span className="label-caps hidden items-center gap-1.5 text-xs text-primary sm:inline-flex">
              {c.teaser.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4"
          >
            <Button
              asChild
              variant="ghost"
              className="label-caps rounded-sm px-0 text-xs hover:bg-transparent hover:text-primary"
            >
              <a href="#verdienst">
                <Calculator />
                {c.hero.secondary}
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroDyno c={c} />
        </motion.div>
      </div>

      <div className="relative border-t bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {c.hero.kpis.map((k, i) => (
            <div
              key={k.label}
              className={cn("px-5 py-6", i > 0 && "md:border-l", i % 2 === 1 && "border-l")}
            >
              <div className="font-display text-3xl font-bold text-strong">
                <CountUp to={k.to} prefix={k.prefix} suffix={k.suffix} locale={c.locale} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compare({ c }: { c: Content }) {
  const t = c.compare;
  return (
    <div className="grid overflow-hidden rounded-md border md:grid-cols-2">
      <Reveal className="bg-sunken p-7 md:p-10">
        <span className="label-caps text-xs text-faint">{t.before}</span>
        <ul className="mt-6 grid gap-4">
          {t.beforeItems.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-lg text-muted-foreground line-through decoration-faint/50"
            >
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border text-faint">
                <X className="size-3.5" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.2} className="bg-strong p-7 text-background md:p-10">
        <span className="label-caps text-xs text-primary">{t.after}</span>
        <ul className="mt-6 grid gap-4">
          {t.afterItems.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 + i * 0.12 }}
              className="flex items-start gap-3 text-lg font-semibold"
            >
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
              {item}
            </motion.li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

const STEP_ICONS = [UserPlus, Download, Upload, Cpu];

function StepCard({ c, i }: { c: Content; i: number }) {
  const s = c.steps.items[i];
  if (!s) return null;
  const Icon = STEP_ICONS[i] ?? Cpu;
  return (
    <div className="flex h-full flex-col rounded-md border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-display text-4xl font-bold text-primary">0{i + 1}</span>
        <span className="flex size-9 items-center justify-center rounded-sm border bg-sunken text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <h3 className="mt-auto pt-6 text-lg">{s.title}</h3>
      <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
    </div>
  );
}

function PinnedSteps({ c }: { c: Content }) {
  const ref = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const preference = useReducedMotion();
  const [reduce, setReduce] = useState(false);
  const [travel, setTravel] = useState(0);
  useEffect(() => {
    setReduce(preference === true);
  }, [preference]);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const measure = () => setTravel(Math.max(0, strip.scrollWidth - window.innerWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [reduce]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -travel]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  const header = (
    <div>
      <span className="kicker">{c.steps.kicker}</span>
      <h2 className="mt-3 max-w-3xl text-3xl leading-[1.08] md:text-5xl">{c.steps.title}</h2>
    </div>
  );

  const grid = (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {c.steps.items.map((s, i) => (
        <Reveal key={s.title} delay={0.1 * i} className="h-full">
          <StepCard c={c} i={i} />
        </Reveal>
      ))}
    </div>
  );

  if (reduce) {
    return (
      <section ref={ref} id="ablauf" className="scroll-mt-16 border-b bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28 md:pl-20">
          {header}
          {grid}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="ablauf" className="scroll-mt-16 border-b bg-sunken">
      <div className="mx-auto max-w-6xl px-5 py-20 md:hidden">
        {header}
        {grid}
      </div>
      <div className="relative hidden h-[300vh] md:block">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden">
          <div className="mx-auto w-full max-w-6xl px-5 pl-20">
            {header}
            <div className="mt-6 flex items-center gap-4">
              <div className="h-0.5 flex-1 overflow-hidden bg-border">
                <motion.div className="h-full origin-left bg-primary" style={{ scaleX: bar }} />
              </div>
              <span className="font-mono text-[11px] uppercase text-faint">{c.stepsHint}</span>
            </div>
          </div>
          <motion.div
            ref={stripRef}
            style={{ x }}
            className="mt-10 flex gap-6 pl-[max(5rem,calc((100vw-72rem)/2+5rem))]"
          >
            {c.steps.items.map((s, i) => (
              <div key={s.title} className="h-60 w-[min(20rem,70vw)] shrink-0">
                <StepCard c={c} i={i} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IconCard({
  icon,
  title,
  text,
  index,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  index: number;
}) {
  return (
    <Reveal delay={0.08 * index} className="h-full">
      <div className="group h-full rounded-md border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary">
        <div className="flex size-11 items-center justify-center rounded-sm border bg-sunken text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
        <h3 className="mt-5 text-lg">{title}</h3>
        <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </Reveal>
  );
}

export function LandingPageLight({ c, mixed = false }: { c: Content; mixed?: boolean }) {
  const solutionIcons = [ShieldCheck, Clock, Layers, Headphones];
  const year = 2026;

  useEffect(() => {
    if (mixed) document.documentElement.classList.remove("dark");
  }, [mixed]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={mixed ? "light mixed-landing bg-background text-foreground" : undefined}>
        <ScrollProgress />
        <Header c={c} mixed={mixed} />
        <ChapterRail c={c} mixed={mixed} />
        <main>
          {mixed ? <MixedHero c={c} /> : <Hero c={c} />}

          <Section
            id="problem"
            kicker={c.problem.kicker}
            title={c.problem.title}
            intro={c.problem.text}
          >
            <Compare c={c} />
          </Section>

          <Section
            id="loesung"
            kicker={c.solution.kicker}
            title={c.solution.title}
            intro={c.solution.text}
            className={mixed ? "dark bg-background text-foreground" : undefined}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {c.solution.features.map((p, i) => {
                const Icon = solutionIcons[i] ?? ShieldCheck;
                return (
                  <IconCard
                    key={p.title}
                    index={i}
                    icon={<Icon className="size-5" />}
                    title={p.title}
                    text={p.text}
                  />
                );
              })}
            </div>
          </Section>

          {!mixed && <section id="anmeldung" className="scroll-mt-16 border-b bg-card">
            <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:py-28 md:pl-20 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <span className="kicker">{c.wizard.kicker}</span>
                <h2 className="mt-3 text-4xl leading-[1.04] md:text-5xl">{c.wizard.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  {c.wizard.lead}
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
                  {c.wizard.kpis.map(([v, l]) => (
                    <div key={l}>
                      <div className="font-display text-2xl font-bold text-strong">{v}</div>
                      <div className="text-sm text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <PartnerWizard c={c} />
              </Reveal>
            </div>
          </section>}

          {mixed && (
            <Section
              id="anmeldung"
              kicker={c.partnerEmbed.kicker}
              title={c.partnerEmbed.title}
              intro={c.partnerEmbed.intro}
              className="bg-sunken"
            >
              <Reveal>
                <PartnerWizardDct c={c} />
              </Reveal>
            </Section>
          )}

          <div className={mixed ? "dark bg-background text-foreground" : undefined}>
            <PinnedSteps c={c} />
          </div>

          <TuningDrive c={c} />

          <Section id="portal-demo" kicker={c.portal.kicker} title={c.portal.title} intro={c.portal.intro}>
            <Reveal>
              <FileServiceTeaser c={c} />
            </Reveal>
          </Section>

          <Section
            id="dyno-vergleich"
            kicker={c.dynoCompare.kicker}
            title={c.dynoCompare.title}
            intro={c.dynoCompare.intro}
            className={mixed ? "dark bg-background text-foreground" : "bg-sunken"}
          >
            <Reveal>
              <DynoCompare c={c} />
            </Reveal>
          </Section>

          <Section id="verdienst" kicker={c.calculator.kicker} title={c.calculator.title}>
            <Reveal>
              <EarningsCalculator c={c} />
            </Reveal>
          </Section>

          <Section
            id="fahrzeug-check"
            kicker={c.vehicleCheck.kicker}
            title={c.vehicleCheck.title}
            intro={c.vehicleCheck.intro}
            className="bg-sunken"
          >
            <Reveal>
              <VehicleCheck c={c} />
            </Reveal>
          </Section>

          <Section
            id="tool-berater"
            kicker={c.advisor.kicker}
            title={c.advisor.title}
            intro={c.advisor.intro}
            className={mixed ? "dark bg-background text-foreground" : undefined}
          >
            <Reveal>
              <ToolAdvisor c={c} />
            </Reveal>
          </Section>

          <Section
            id="konfigurator"
            kicker={c.configurator.kicker}
            title={c.configurator.title}
            intro={c.configurator.text}
            className="bg-sunken"
          >
            <Reveal>
              <Configurator c={c} />
            </Reveal>
          </Section>

          <Section
            id="startplan"
            kicker={c.startPlan.kicker}
            title={c.startPlan.title}
            intro={c.startPlan.intro}
          >
            <Reveal>
              <StartPlan c={c} />
            </Reveal>
          </Section>

          <Section
            id="vertrauen"
            kicker={c.trust.kicker}
            title={c.trust.title}
            className={mixed ? "dark bg-background text-foreground" : undefined}
          >
            <GoogleReviews c={c} />
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {c.trust.strip.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 rounded-sm border bg-sunken px-4 py-3 text-sm text-strong"
                >
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  {s}
                </div>
              ))}
            </div>
          </Section>

          <Section id="faq" kicker={c.faq.kicker} title={c.faq.title}>
            <Reveal>
              <Accordion type="single" collapsible className="rounded-md border bg-card px-5">
                {c.faq.items.map((item, i) => (
                  <AccordionItem key={item.q} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-display text-base font-bold text-strong hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </Section>

          <section className="bg-strong text-background">
            <div className="mx-auto max-w-6xl px-5 py-24 text-center md:py-32 md:pl-20">
              <Reveal>
                <h2 className="text-4xl leading-[1.04] text-background md:text-6xl">
                  {c.final.title}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg opacity-75">{c.final.text}</p>
                <Button asChild size="lg" className="label-caps mt-9 h-13 rounded-sm px-7">
                  <a href="#anmeldung">
                    {c.final.cta}
                    <ArrowRight />
                  </a>
                </Button>
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="border-t bg-sunken">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between md:pl-20">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-muted-foreground">{c.footer.claim}</p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <LegalLinks locale={c.locale} />
              <p className="text-xs text-faint">
                © {year} Tuningfiles-download.com · {c.footer.rights}
              </p>
            </div>
          </div>
        </footer>

        <a
          href="#anmeldung"
          className={cn(
            "label-caps fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs text-primary-foreground shadow-2xl transition-colors hover:bg-primary-hover sm:hidden",
            mixed && "hidden",
          )}
        >
          {c.nav.cta}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </MotionConfig>
  );
}
