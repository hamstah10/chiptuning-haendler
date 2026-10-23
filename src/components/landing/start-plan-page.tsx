import { Link } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { ArrowRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, ThemeToggle } from "./landing-page";
import { StartPlan } from "./start-plan";
import type { Content } from "@/lib/content";

/** Standalone start plan page: slim header, generator, footer – reachable via its own URL. */
export function StartPlanPage({ c }: { c: Content }) {
  const year = 2026;
  const home = c.locale === "de" ? "/" : "/en";
  const langTarget = c.locale === "de" ? "/en/startplan" : "/startplan";

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to={home} aria-label="Tuningfiles-download.com">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="label-caps rounded-sm text-xs">
              <Link to={langTarget} hrefLang={c.locale === "de" ? "en" : "de"}>
                <Languages />
                {c.nav.switchLang}
              </Link>
            </Button>
            <ThemeToggle c={c} />
            <Button asChild className="label-caps hidden rounded-sm sm:inline-flex">
              <Link to={home} hash="anmeldung">
                {c.nav.cta}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <span className="kicker">{c.startPlan.pageKicker}</span>
            <h1 className="mt-3 max-w-3xl text-4xl leading-[1.04] md:text-5xl">{c.startPlan.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{c.startPlan.intro}</p>
            <div className="mt-12">
              <StartPlan c={c} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-sunken">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">{c.footer.claim}</p>
          </div>
          <p className="text-xs text-faint">© {year} Tuningfiles-download.com · {c.footer.rights}</p>
        </div>
      </footer>
    </MotionConfig>
  );
}
