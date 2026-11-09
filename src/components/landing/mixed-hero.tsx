import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Content } from "@/lib/content";
import workshopImage from "@/assets/mixed-hero-workshop.jpg";
import dynoImage from "@/assets/hero-slide-dyno.jpg";
import obdImage from "@/assets/hero-slide-obd.jpg";
import carImage from "@/assets/hero-slide-car.jpg";
import { CountUp } from "./motion";

const SLIDES = [workshopImage, dynoImage, obdImage, carImage];
const SLIDE_MS = 6000;

export function MixedHero({ c }: { c: Content }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (reduce || paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduce, paused]);

  return (
    <section id="top" className="dark bg-background text-foreground">
      <div
        className="mixed-hero relative isolate overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={index}
            src={SLIDES[index]}
            alt={c.design.heroImageAlt}
            width={1920}
            height={1088}
            className="mixed-hero-image absolute inset-0 -z-20 h-full w-full object-cover"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.3 : 1.1, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div className="mixed-hero-shade absolute inset-0 -z-10" aria-hidden />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-5 py-12 md:py-16 md:pl-20">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-xl"
          >
            <span className="kicker">{c.hero.kicker}</span>
            <h1 className="mt-5 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              {c.hero.title1}
            </h1>
            <p className="mt-2 font-display text-3xl font-bold italic uppercase text-primary sm:text-4xl">
              {c.hero.title2}
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground md:text-lg">
              {c.hero.lead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-sm px-5">
                <a href="#anmeldung">
                  {c.hero.primary}
                  <ArrowRight />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-sm bg-background/80 px-5"
              >
                <a href="#verdienst">
                  <Calculator />
                  {c.hero.secondary}
                </a>
              </Button>
            </div>
          </motion.div>
          <div className="mt-9 flex items-center gap-6">
            <a
              href="#problem"
              className="inline-flex w-fit items-center gap-3 text-xs text-muted-foreground"
            >
              <ArrowDown className="size-4 text-primary" />
              {c.hero.scroll}
            </a>
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero-Slider">
              <button
                type="button"
                aria-label="Vorheriges Bild"
                onClick={() => go(index - 1)}
                className="flex size-8 items-center justify-center rounded-sm border border-border bg-background/60 text-foreground transition-colors hover:bg-background/90"
              >
                <ChevronLeft className="size-4" />
              </button>
              {SLIDES.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Bild ${i + 1} von ${SLIDES.length}`}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-7 bg-primary" : "w-3 bg-foreground/30 hover:bg-foreground/60"
                  }`}
                />
              ))}
              <button
                type="button"
                aria-label="Nächstes Bild"
                onClick={() => go(index + 1)}
                className="flex size-8 items-center justify-center rounded-sm border border-border bg-background/60 text-foreground transition-colors hover:bg-background/90"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-border" aria-hidden>
          <motion.div
            key={index}
            className="h-full origin-left bg-primary"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }}
          />
        </div>
      </div>
      <div className="light border-b bg-card text-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 md:pl-20">
          {c.hero.kpis.map((k) => (
            <div key={k.label} className="border-r border-border px-5 py-5 last:border-r-0 md:py-7">
              <div className="font-display text-3xl font-bold text-strong">
                <CountUp to={k.to} prefix={k.prefix} suffix={k.suffix} locale={c.locale} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{k.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
