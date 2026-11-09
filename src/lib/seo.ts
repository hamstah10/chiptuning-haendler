import type { Locale } from "./format";
import ogLanding from "@/assets/og-landing.jpg.asset.json";
import ogStartPlan from "@/assets/og-startplan.jpg.asset.json";

const SITE = "https://chiptuning.company";
const imageTags = (url: string) => [
  { property: "og:image", content: `${SITE}${url}` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { name: "twitter:image", content: `${SITE}${url}` },
];

const meta: Record<Locale, { title: string; description: string; path: string; ogLocale: string }> = {
  de: {
    title: "Chiptuning-Händler werden – Tuningfiles-download.com",
    description:
      "Werde Chiptuning-Händler: geprüfte Tuningfiles in 30–60 Minuten, Stage 1–3, ohne Grundgebühr und ohne Vertragsbindung. Jetzt in 2 Minuten als Partner anmelden.",
    path: "/",
    ogLocale: "de_DE",
  },
  en: {
    title: "Become a chiptuning dealer – Tuningfiles-download.com",
    description:
      "Become a chiptuning dealer: tested tuning files in 30–60 minutes, Stage 1–3, no base fee and no contract lock-in. Sign up as a partner in 2 minutes.",
    path: "/en",
    ogLocale: "en_GB",
  },
};

const startPlanMeta: Record<Locale, { title: string; description: string; path: string; ogLocale: string }> = {
  de: {
    title: "Startplan: Chiptuning-Händler werden – Tuningfiles-download.com",
    description:
      "Dein persönlicher Fahrplan in den Chiptuning-Handel: Die KI erstellt aus deinen Angaben einen konkreten Startplan mit ersten Schritten, realistischem Zeitrahmen und passendem Paket. Kostenlos und unverbindlich.",
    path: "/startplan",
    ogLocale: "de_DE",
  },
  en: {
    title: "Start plan: become a chiptuning dealer – Tuningfiles-download.com",
    description:
      "Your personal roadmap into the chiptuning trade: the AI turns your details into a concrete start plan with first steps, a realistic timeframe and the right package. Free and without obligation.",
    path: "/en/startplan",
    ogLocale: "en_GB",
  },
};

export function startPlanHead(locale: Locale) {
  const m = startPlanMeta[locale];
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: m.path },
      { property: "og:locale", content: m.ogLocale },
      { name: "twitter:card", content: "summary_large_image" },
      ...imageTags(ogStartPlan.url),
      { name: "twitter:title", content: m.title },
      { name: "twitter:description", content: m.description },
    ],
    links: [
      { rel: "canonical", href: m.path },
      { rel: "alternate", hrefLang: "de", href: "/startplan" },
      { rel: "alternate", hrefLang: "en", href: "/en/startplan" },
      { rel: "alternate", hrefLang: "x-default", href: "/startplan" },
    ],
  };
}

export function landingHead(locale: Locale) {
  const m = meta[locale];
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: m.path },
      { property: "og:locale", content: m.ogLocale },
      { name: "twitter:card", content: "summary_large_image" },
      ...imageTags(ogLanding.url),
      { name: "twitter:title", content: m.title },
      { name: "twitter:description", content: m.description },
    ],
    links: [
      { rel: "canonical", href: m.path },
      { rel: "alternate", hrefLang: "de", href: "/" },
      { rel: "alternate", hrefLang: "en", href: "/en" },
      { rel: "alternate", hrefLang: "x-default", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: m.title,
          description: m.description,
          serviceType: "Chiptuning file service",
          areaServed: "Europe",
          provider: { "@type": "Organization", name: "Tuningfiles-download.com", foundingDate: "2005" },
        }),
      },
    ],
  };
}
