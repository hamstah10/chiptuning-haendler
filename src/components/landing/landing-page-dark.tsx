import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  ChevronDown,
  Clock,
  Cpu,
  Download,
  Headphones,
  Languages,
  Layers,
  Moon,
  Quote,
  ShieldCheck,
  Sun,
  Upload,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CountUp, Reveal, ScrollProgress } from "./motion";
import { Configurator } from "./configurator";
import { PartnerWizard } from "./partner-wizard";
import { EarningsCalculator } from "./earnings-calculator";
import { FileServiceTeaser } from "./file-service-teaser";
import { DynoCompare } from "./dyno-compare";
import { Logo } from "./logo";
import { ToolAdvisor } from "./tool-advisor";
import { StartPlan } from "./start-plan";
import { VehicleCheck } from "./vehicle-check";
import { TuningDrive } from "./tuning-drive";

import { LegalLinks } from "./legal-links";
import type { Content } from "@/lib/content";

// Brand logo is shared with the light design.

function ThemeToggle({ c }: { c: Content }) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    setLight(localStorage.getItem("tf-theme-dark-design") === "light");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", !light);
  }, [light]);
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-sm"
      aria-label={light ? c.nav.themeDark : c.nav.themeLight}
      onClick={() => {
        const nextLight = !light;
        setLight(nextLight);
        localStorage.setItem("tf-theme-dark-design", nextLight ? "light" : "dark");
      }}
    >
      {light ? <Moon /> : <Sun />}
    </Button>
  );
}

function Header({ c }: { c: Content }) {
  const links: [string, string][] = [
    ["#problem", c.nav.story],
    ["#ablauf", c.nav.process],
    ["#verdienst", c.nav.calculator],
    ["#konfigurator", c.nav.configurator],
    ["#faq", c.nav.faq],
  ];
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#top" aria-label="Tuningfiles-download.com">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="label-caps whitespace-nowrap text-xs text-muted-foreground transition-colors hover:text-strong">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="label-caps rounded-sm text-xs">
            <Link to={c.locale === "de" ? "/en" : "/"} hrefLang={c.locale === "de" ? "en" : "de"}>
              <Languages />
              {c.nav.switchLang}
            </Link>
          </Button>
          <ThemeToggle c={c} />
          <Button asChild className="label-caps hidden rounded-sm sm:inline-flex">
            <a href="#anmeldung">
              {c.nav.cta}
              <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

/** Kickers carry the chapter number of the light design; renumber them for this design's order. */
const DARK_ORDER = ["problem", "loesung", "ablauf", "verdienst", "konfigurator", "startplan", "anmeldung", "vertrauen", "faq"];
function chapterKicker(kicker: string, id: string) {
  return kicker.replace(/\d{2}/, String(DARK_ORDER.indexOf(id) + 1).padStart(2, "0"));
}

function Section({ id, kicker, title, children, intro }: { id: string; kicker: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <span className="kicker">{chapterKicker(kicker, id)}</span>
          <h2 className="mt-3 max-w-3xl text-3xl leading-[1.08] md:text-5xl">{title}</h2>
          {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function Hero({ c }: { c: Content }) {
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 600], [0, 160]);
  const gaugeRotate = useTransform(scrollY, [0, 600], [-40, 80]);

  return (
    <section id="top" className="relative overflow-hidden border-b">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
      <motion.div aria-hidden className="glow-red absolute -right-40 -top-48 size-[680px] rounded-full" style={{ y: glowY }} />
      <motion.div aria-hidden className="absolute -right-24 top-24 hidden size-[420px] rounded-full border-2 border-dashed border-border-strong lg:block" style={{ rotate: gaugeRotate }}>
        <div className="absolute left-1/2 top-4 h-1/2 w-1 -translate-x-1/2 origin-bottom rounded-full bg-primary" />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 md:pt-28">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="kicker block">
          {c.hero.kicker}
        </motion.span>
        <h1 className="mt-5 text-[2.6rem] leading-[1.02] sm:text-6xl md:text-7xl">
          <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            {c.hero.title1}
          </motion.span>
          <motion.span className="block text-primary" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            {c.hero.title2}
          </motion.span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {c.hero.lead}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg" className="label-caps h-13 rounded-sm px-6">
            <a href="#anmeldung">
              {c.hero.primary}
              <ArrowRight />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="label-caps h-13 rounded-sm bg-card px-6">
            <a href="#verdienst">
              <Calculator />
              {c.hero.secondary}
            </a>
          </Button>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-6 border-t pt-8 md:grid-cols-4">
          {c.hero.kpis.map((k, i) => (
            <Reveal key={k.label} delay={0.1 * i}>
              <div className="font-display text-3xl font-bold text-strong md:text-4xl">
                <CountUp to={k.to} prefix={k.prefix} suffix={k.suffix} locale={c.locale} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{k.label}</div>
            </Reveal>
          ))}
        </div>

        <a href="#problem" className="mt-14 flex items-center gap-2 text-xs uppercase tracking-widest text-faint hover:text-strong">
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ChevronDown className="size-4" />
          </motion.span>
          {c.hero.scroll}
        </a>
      </div>
    </section>
  );
}

function IconCard({ icon, title, text, index }: { icon: ReactNode; title: string; text: string; index: number }) {
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

function Steps({ c }: { c: Content }) {
  const icons = [UserPlus, Download, Upload, Cpu];
  return (
    <div className="relative grid gap-6 md:grid-cols-4">
      <motion.div
        aria-hidden
        className="absolute left-0 right-0 top-6 hidden h-0.5 origin-left bg-primary md:block"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      {c.steps.items.map((s, i) => {
        const Icon = icons[i] ?? Cpu;
        return (
          <Reveal key={s.title} delay={0.25 * i} className="relative">
            <div className="relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
              <Icon className="size-5" />
            </div>
            <div className="mt-5 font-mono text-xs text-primary">0{i + 1}</div>
            <h3 className="mt-1 text-xl">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

export function LandingPageDark({ c }: { c: Content }) {
  const problemIcons = [Wallet, Clock, AlertTriangle];
  const solutionIcons = [ShieldCheck, Clock, Layers, Headphones];
  const year = 2026;

  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Header c={c} />
      <main>
        <Hero c={c} />

        <Section id="problem" kicker={c.problem.kicker} title={c.problem.title} intro={c.problem.text}>
          <div className="grid gap-5 md:grid-cols-3">
            {c.problem.points.map((p, i) => {
              const Icon = problemIcons[i] ?? AlertTriangle;
              return <IconCard key={p.title} index={i} icon={<Icon className="size-5" />} title={p.title} text={p.text} />;
            })}
          </div>
        </Section>

        <Section id="loesung" kicker={c.solution.kicker} title={c.solution.title} intro={c.solution.text}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.solution.features.map((p, i) => {
              const Icon = solutionIcons[i] ?? ShieldCheck;
              return <IconCard key={p.title} index={i} icon={<Icon className="size-5" />} title={p.title} text={p.text} />;
            })}
          </div>
        </Section>

        <Section id="ablauf" kicker={c.steps.kicker} title={c.steps.title}>
          <Steps c={c} />
        </Section>

        <TuningDrive c={c} />

        <Section id="portal-demo" kicker={c.portal.kicker} title={c.portal.title} intro={c.portal.intro}>
          <Reveal>
            <FileServiceTeaser c={c} />
          </Reveal>
        </Section>

        <Section id="dyno-vergleich" kicker={c.dynoCompare.kicker} title={c.dynoCompare.title} intro={c.dynoCompare.intro}>
          <Reveal>
            <DynoCompare c={c} />
          </Reveal>
        </Section>


        <Section id="verdienst" kicker={c.calculator.kicker} title={c.calculator.title}>
          <Reveal>
            <EarningsCalculator c={c} />
          </Reveal>
        </Section>

        <Section id="fahrzeug-check" kicker={c.vehicleCheck.kicker} title={c.vehicleCheck.title} intro={c.vehicleCheck.intro}>
          <Reveal>
            <VehicleCheck c={c} />
          </Reveal>
        </Section>

        <Section id="tool-berater" kicker={c.advisor.kicker} title={c.advisor.title} intro={c.advisor.intro}>
          <Reveal>
            <ToolAdvisor c={c} />
          </Reveal>
        </Section>

        <Section id="konfigurator" kicker={c.configurator.kicker} title={c.configurator.title} intro={c.configurator.text}>
          <Reveal>
            <Configurator c={c} />
          </Reveal>
        </Section>

        <Section id="startplan" kicker={c.startPlan.kicker} title={c.startPlan.title} intro={c.startPlan.intro}>
          <Reveal>
            <StartPlan c={c} />
          </Reveal>
        </Section>

        <section id="anmeldung" className="relative scroll-mt-20 overflow-hidden border-b">
          <div aria-hidden className="glow-red absolute -left-60 top-0 size-[640px] rounded-full" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <span className="kicker">{chapterKicker(c.wizard.kicker, "anmeldung")}</span>
              <h2 className="mt-3 text-4xl leading-[1.04] md:text-5xl">{c.wizard.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{c.wizard.lead}</p>
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
        </section>

        <Section id="vertrauen" kicker={c.trust.kicker} title={c.trust.title}>
          <div className="grid gap-5 md:grid-cols-3">
            {c.trust.quotes.map((q, i) => (
              <Reveal key={q.a} delay={0.1 * i} className="h-full">
                <figure className="flex h-full flex-col rounded-md border bg-card p-6">
                  <Quote className="size-6 text-primary" />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-strong">{q.q}</blockquote>
                  <figcaption className="mt-5 flex items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
                    {q.a}
                    <span className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase text-faint">{c.trust.sample}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {c.trust.strip.map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-sm border bg-sunken px-4 py-3 text-sm text-strong">
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
                  <AccordionTrigger className="text-left font-display text-base font-bold text-strong hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </Section>

        <section className="relative overflow-hidden">
          <div aria-hidden className="grid-lines absolute inset-0 opacity-50" />
          <div className="relative mx-auto max-w-4xl px-5 py-24 text-center md:py-32">
            <Reveal>
              <h2 className="text-4xl leading-[1.04] md:text-6xl">{c.final.title}</h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{c.final.text}</p>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between">
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
        className="label-caps fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs text-primary-foreground shadow-2xl transition-colors hover:bg-primary-hover sm:hidden"
      >
        {c.nav.cta}
        <ArrowRight className="size-4" />
      </a>
    </MotionConfig>
  );
}
