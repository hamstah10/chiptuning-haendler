import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, ThemeToggle } from "./landing-page";
import { LegalLinks } from "./legal-links";
import { LanguageSelector } from "./language-selector";
import { legal, legalPaths, provider } from "@/lib/legal";
import type { Content } from "@/lib/content";

export function LegalPage({ c, kind }: { c: Content; kind: "imprint" | "privacy" }) {
  const t = legal[c.locale];
  const paths = legalPaths[c.locale];
  const year = 2026;

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to={paths.home} aria-label="Tuningfiles-download.com">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector locale={c.locale} page={kind} />
            <ThemeToggle c={c} />
            <Button asChild variant="outline" size="sm" className="label-caps rounded-sm text-xs">
              <Link to={paths.home}>
                <ArrowLeft />
                {t.back}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <h1 className="text-4xl leading-[1.05] md:text-5xl">{kind === "imprint" ? t.imprintTitle : t.privacyTitle}</h1>

        {kind === "imprint" ? (
          <div className="mt-10 grid gap-8 leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-xl">{t.imprint.providerTitle}</h2>
              <p className="mt-3">
                {provider.name}
                {provider.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </section>
            <section>
              <h2 className="text-xl">{t.imprint.contactTitle}</h2>
              <p className="mt-3">
                {t.imprint.phone}: <a className="text-primary hover:underline" href={`tel:${provider.phoneHref}`}>{provider.phone}</a>
                <span className="block">
                  {t.imprint.email}: <a className="text-primary hover:underline" href={`mailto:${provider.email}`}>{provider.email}</a>
                </span>
              </p>
            </section>
            {provider.vatId && (
              <section>
                <h2 className="text-xl">{t.imprint.vatTitle}</h2>
                <p className="mt-3">{provider.vatId}</p>
              </section>
            )}
            <section>
              <h2 className="text-xl">{t.imprint.responsibleTitle}</h2>
              <p className="mt-3">
                {provider.name}, {provider.address.slice(0, 2).join(", ")}
              </p>
            </section>
            {t.imprint.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-xl">{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p} className="mt-3">{p}</p>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-8 leading-relaxed text-muted-foreground">
            <p className="text-sm text-faint">{t.privacy.updated}</p>
            {t.privacy.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-xl">{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p} className="mt-3">{p}</p>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t bg-sunken">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="flex flex-col gap-2 md:items-end">
            <LegalLinks locale={c.locale} />
            <p className="text-xs text-faint">© {year} Tuningfiles-download.com · {c.footer.rights}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
