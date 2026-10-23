import type { Locale } from "./format";

/** Official provider data (source: business profile). Empty fields are left out of the pages. */
export const provider = {
  name: "André Sancken",
  address: ["Deichstr. 48", "27568 Bremerhaven", "Deutschland"],
  phone: "0471 - 41851468",
  phoneHref: "+4947141851468",
  email: "andre@intelligent-automotive.de",
  vatId: "",
};

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalTexts {
  imprintTitle: string;
  privacyTitle: string;
  imprintLink: string;
  privacyLink: string;
  back: string;
  imprint: {
    providerTitle: string;
    contactTitle: string;
    phone: string;
    email: string;
    vatTitle: string;
    responsibleTitle: string;
    sections: LegalSection[];
  };
  privacy: { updated: string; sections: LegalSection[] };
}

const de: LegalTexts = {
  imprintTitle: "Impressum",
  privacyTitle: "Datenschutzerklärung",
  imprintLink: "Impressum",
  privacyLink: "Datenschutz",
  back: "Zur Startseite",
  imprint: {
    providerTitle: "Angaben gemäß § 5 DDG",
    contactTitle: "Kontakt",
    phone: "Telefon",
    email: "E-Mail",
    vatTitle: "Umsatzsteuer-ID",
    responsibleTitle: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
    sections: [
      {
        title: "Verbraucherstreitbeilegung",
        paragraphs: [
          "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Unser Angebot richtet sich an gewerbliche Kunden.",
        ],
      },
      {
        title: "Haftung für Inhalte",
        paragraphs: [
          "Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende Inhalte umgehend.",
          "Leistungs- und Preisangaben in Rechnern, Konfigurator und Fahrzeug-Check sind Beispielwerte und kein verbindliches Angebot.",
        ],
      },
      {
        title: "Haftung für Links",
        paragraphs: [
          "Unsere Seiten enthalten gegebenenfalls Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.",
        ],
      },
      {
        title: "Urheberrecht",
        paragraphs: [
          "Die Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen unserer schriftlichen Zustimmung. Genannte Marken und Produktnamen (z. B. von Tool-Herstellern) gehören ihren jeweiligen Inhabern.",
        ],
      },
    ],
  },
  privacy: {
    updated: "Stand: 23.10.2026",
    sections: [
      {
        title: "1. Verantwortlicher",
        paragraphs: [
          "Verantwortlich für die Datenverarbeitung auf dieser Website ist André Sancken, Deichstr. 48, 27568 Bremerhaven, Telefon 0471 - 41851468, E-Mail andre@intelligent-automotive.de.",
        ],
      },
      {
        title: "2. Hosting und Server-Logs",
        paragraphs: [
          "Die Website wird bei einem externen Hosting-Dienstleister betrieben. Beim Aufruf werden technisch notwendige Daten verarbeitet (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser-Typ). Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Mit dem Dienstleister besteht ein Vertrag zur Auftragsverarbeitung.",
        ],
      },
      {
        title: "3. Partner-Anmeldung und Konfigurator-Anfragen",
        paragraphs: [
          "Wenn du dich als Partner anmeldest oder eine Anfrage über den Konfigurator sendest, speichern wir deine Angaben (z. B. Firma, Name, E-Mail, Telefon und Details zu deiner Anfrage), um mit dir Kontakt aufzunehmen und die Partnerschaft vorzubereiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen).",
          "Die Daten werden in einer geschützten Datenbank gespeichert, auf die nur wir Zugriff haben. Wir löschen sie, sobald sie für den Zweck nicht mehr nötig sind und keine gesetzlichen Aufbewahrungspflichten bestehen.",
        ],
      },
      {
        title: "4. KI-Startplan",
        paragraphs: [
          "Für den Startplan-Generator werden deine Angaben (Erfahrung, Betriebsart, Ziele und optionaler Freitext) an einen KI-Dienst übermittelt, der daraus den Plan erstellt. Bitte gib dort keine Namen oder Kontaktdaten ein. Wir speichern diese Eingaben nicht in unserer Datenbank. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, da du die Funktion aktiv anforderst.",
          "Dein erstellter Plan wird nur lokal in deinem Browser gespeichert und kann dort jederzeit über „Neu starten“ gelöscht werden.",
        ],
      },
      {
        title: "5. Lokaler Speicher im Browser",
        paragraphs: [
          "Wir speichern deine Auswahl für Design, Hell/Dunkel-Modus und deinen Startplan im lokalen Speicher deines Browsers. Diese Daten verlassen dein Gerät nicht. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.",
        ],
      },
      {
        title: "6. Schriftarten",
        paragraphs: [
          "Zur einheitlichen Darstellung laden wir Schriftarten von Google Fonts (Google Ireland Limited). Dabei wird deine IP-Adresse an Google übertragen. Rechtsgrundlage ist unser berechtigtes Interesse an einer einheitlichen Darstellung (Art. 6 Abs. 1 lit. f DSGVO).",
        ],
      },
      {
        title: "7. Deine Rechte",
        paragraphs: [
          "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung (Art. 15–21 DSGVO). Eine Einwilligung kannst du jederzeit widerrufen. Schreib uns dazu einfach eine E-Mail.",
          "Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, z. B. bei der Landesbeauftragten für Datenschutz und Informationsfreiheit der Freien Hansestadt Bremen.",
        ],
      },
    ],
  },
};

const en: LegalTexts = {
  imprintTitle: "Imprint",
  privacyTitle: "Privacy policy",
  imprintLink: "Imprint",
  privacyLink: "Privacy",
  back: "Back to home",
  imprint: {
    providerTitle: "Information pursuant to § 5 DDG (German Digital Services Act)",
    contactTitle: "Contact",
    phone: "Phone",
    email: "Email",
    vatTitle: "VAT ID",
    responsibleTitle: "Responsible for content according to § 18 (2) MStV",
    sections: [
      {
        title: "Consumer dispute resolution",
        paragraphs: ["We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board. Our offer is aimed at business customers."],
      },
      {
        title: "Liability for content",
        paragraphs: [
          "As a service provider we are responsible for our own content on these pages under general law. We are not obliged to monitor transmitted or stored third-party information. If we become aware of legal violations, we will remove such content immediately.",
          "Performance and price figures in the calculators, configurator and vehicle check are example values and not a binding offer.",
        ],
      },
      {
        title: "Liability for links",
        paragraphs: ["Our pages may contain links to external websites whose content we cannot influence. The respective provider is always responsible for that content."],
      },
      {
        title: "Copyright",
        paragraphs: ["The content on these pages is subject to German copyright law. Brands and product names mentioned (e.g. of tool manufacturers) belong to their respective owners."],
      },
    ],
  },
  privacy: {
    updated: "Last updated: 23/10/2026",
    sections: [
      {
        title: "1. Controller",
        paragraphs: ["The controller for data processing on this website is André Sancken, Deichstr. 48, 27568 Bremerhaven, Germany, phone +49 471 41851468, email andre@intelligent-automotive.de."],
      },
      {
        title: "2. Hosting and server logs",
        paragraphs: [
          "The website is operated by an external hosting provider. When you visit, technically necessary data is processed (IP address, date and time, page requested, browser type). The legal basis is our legitimate interest in secure and stable operation (Art. 6(1)(f) GDPR). A data processing agreement is in place with the provider.",
        ],
      },
      {
        title: "3. Partner sign-up and configurator requests",
        paragraphs: [
          "When you sign up as a partner or send a request via the configurator, we store your details (e.g. company, name, email, phone and request details) to contact you and prepare the partnership. The legal basis is Art. 6(1)(b) GDPR (pre-contractual measures).",
          "The data is stored in a protected database that only we can access. We delete it once it is no longer needed and no statutory retention obligations apply.",
        ],
      },
      {
        title: "4. AI start plan",
        paragraphs: [
          "For the start plan generator, your answers (experience, business type, goals and optional free text) are sent to an AI service that creates the plan. Please do not enter names or contact details there. We do not store these inputs in our database. The legal basis is Art. 6(1)(b) GDPR, as you actively request the feature.",
          "Your plan is only stored locally in your browser and can be deleted at any time via “Start again”.",
        ],
      },
      {
        title: "5. Local browser storage",
        paragraphs: ["We store your design choice, light/dark mode and your start plan in your browser's local storage. This data does not leave your device. No tracking or advertising cookies are used."],
      },
      {
        title: "6. Fonts",
        paragraphs: ["To display text consistently we load fonts from Google Fonts (Google Ireland Limited). Your IP address is transmitted to Google in the process. The legal basis is our legitimate interest in consistent presentation (Art. 6(1)(f) GDPR)."],
      },
      {
        title: "7. Your rights",
        paragraphs: [
          "You have the right to access, rectification, erasure, restriction of processing, data portability and to object (Art. 15–21 GDPR). You can withdraw consent at any time. Just send us an email.",
          "You also have the right to lodge a complaint with a data protection supervisory authority, e.g. the State Commissioner for Data Protection and Freedom of Information of the Free Hanseatic City of Bremen.",
        ],
      },
    ],
  },
};

export const legal: Record<Locale, LegalTexts> = { de, en };

export const legalPaths: Record<Locale, { imprint: "/impressum" | "/en/imprint"; privacy: "/datenschutz" | "/en/privacy"; home: "/" | "/en" }> = {
  de: { imprint: "/impressum", privacy: "/datenschutz", home: "/" },
  en: { imprint: "/en/imprint", privacy: "/en/privacy", home: "/en" },
};

export function legalHead(locale: Locale, kind: "imprint" | "privacy") {
  const t = legal[locale];
  const title = `${kind === "imprint" ? t.imprintTitle : t.privacyTitle} – Tuningfiles-download.com`;
  const description =
    locale === "de"
      ? kind === "imprint"
        ? "Impressum und Anbieterkennzeichnung von Tuningfiles-download.com."
        : "Datenschutzerklärung von Tuningfiles-download.com: welche Daten wir verarbeiten und welche Rechte du hast."
      : kind === "imprint"
        ? "Imprint and provider information of Tuningfiles-download.com."
        : "Privacy policy of Tuningfiles-download.com: what data we process and what rights you have.";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: legalPaths[locale][kind] }],
  };
}
