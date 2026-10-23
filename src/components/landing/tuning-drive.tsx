import { motion, useReducedMotion } from "motion/react";
import type { Content } from "@/lib/content";

/** Shared between the light, mixed and dark compositions: animation on the left, stages on the right. */
export function TuningDrive({ c }: { c: Content }) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="drive" className="dark overflow-hidden border-b bg-media-surface text-foreground">
      <div className="mx-auto grid max-w-6xl items-stretch gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10 lg:gap-14">
        <div className="mx-auto aspect-[9/16] w-full max-w-[440px] overflow-hidden md:max-w-none">
          <iframe
            src="/tuningfiles-animation-view.html"
            title="TuningFiles – Tuning Drive"
            className="h-full w-full border-0"
            loading="lazy"
            allow="autoplay"
          />
        </div>
        <motion.div
          className="min-w-0 self-center px-5 py-12 md:pl-0 md:pr-5 md:py-16"
          initial={false}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <span className="kicker">{c.tuningDrive.kicker}</span>
          <h2 className="mt-3 text-3xl leading-[1.08] text-strong lg:text-5xl">
            {c.tuningDrive.title}
          </h2>
          <div className="mt-8 grid gap-4">
            {c.tuningDrive.stages.slice(0, 3).map((stage, index) => (
              <motion.div
                key={stage.label}
                className="tuning-stage rounded-md border border-border bg-card p-5 transition-colors hover:border-primary"
                initial={false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: index * 0.15 }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-xs font-bold uppercase text-primary">
                    {stage.label}
                  </span>
                  <span className="font-mono text-xs text-faint">
                    {stage.ps} · {stage.nm}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-strong">{stage.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{stage.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
