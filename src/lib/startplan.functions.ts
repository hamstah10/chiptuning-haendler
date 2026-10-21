import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const startPlanSchema = z.object({
  locale: z.enum(["de", "en"]),
  experience: z.string().trim().min(2).max(120),
  businessType: z.string().trim().min(2).max(120),
  weeklyHours: z.string().trim().min(2).max(120),
  timeframe: z.string().trim().min(2).max(120),
  goal: z.string().trim().min(2).max(120),
  note: z.string().trim().max(500).optional(),
});

export type StartPlanInput = z.infer<typeof startPlanSchema>;

export type StartPlanResult = { ok: true; plan: string } | { ok: false; error: string };

const SYSTEM_DE = `Du bist der Partnerberater von Tuningfiles-download.com, einem professionellen Chiptuning-Dateiservice (seit 2005, über 8.400 Fahrzeuge in der Datenbank, 62 Marken inkl. Landtechnik und Marine).

Deine Aufgabe: Erstelle für einen angehenden Chiptuning-Händler einen personalisierten, konkreten Startplan für den Aufbau seines Tuning-Geschäfts.

Fakten, auf die du dich beziehen darfst:
- Geprüfte Kennfelder werden in 30 bis 60 Minuten geliefert.
- Drei Pakete: Starter (0 € Grundgebühr, 39 € pro Datei), Professional (149 €/Monat, 32 € pro Datei, inkl. Konfigurator für die eigene Website), Premium (349 €/Monat, 28 € pro Datei, mehrere Standorte, fester Ansprechpartner).
- Keine Vertragsbindung, Professional und Premium monatlich kündbar.
- Support auf Deutsch, Begleitung des ersten Auslesens per Fernwartung möglich.
- Gängige Lese-/Schreibgeräte: Autotuner, Alientech KESS3, MagicMotorsport Flex, CMD Flash.

Regeln für den Plan:
- Antworte auf Deutsch, in der Du-Form, freundlich und professionell, Überschriften in Satzschreibweise.
- Struktur: Markdown mit genau drei Phasen (## Phase 1 …, ## Phase 2 …, ## Phase 3 …) mit realistischen Zeiträumen, darunter je 3 bis 5 konkrete Schritte als Aufzählung. Danach ein Abschnitt ## Passendes Paket mit einer begründeten Empfehlung.
- Sei konkret und realistisch: keine Erfolgsgarantien, keine erfundenen Zahlen, keine Rechts- oder Steuerberatung.
- Maximal 380 Wörter. Kein HTML, nur Markdown.`;

const SYSTEM_EN = `You are the partner advisor of Tuningfiles-download.com, a professional chiptuning file service (established 2005, over 8,400 vehicles in the database, 62 brands including agricultural and marine).

Your task: Create a personalized, concrete start plan for a prospective chiptuning dealer to build their tuning business.

Facts you may refer to:
- Tested maps are delivered in 30 to 60 minutes.
- Three packages: Starter (€0 base fee, €39 per file), Professional (€149/month, €32 per file, incl. configurator for the dealer's website), Premium (€349/month, €28 per file, multiple locations, dedicated contact).
- No contract lock-in; Professional and Premium can be cancelled monthly.
- Personal support, remote guidance for the first ECU read available.
- Common read/write tools: Autotuner, Alientech KESS3, MagicMotorsport Flex, CMD Flash.

Rules for the plan:
- Answer in English, friendly and professional, headings in sentence case.
- Structure: Markdown with exactly three phases (## Phase 1 …, ## Phase 2 …, ## Phase 3 …) with realistic timeframes, each with 3 to 5 concrete bullet-point steps. Then a ## Recommended package section with a justified recommendation.
- Be concrete and realistic: no success guarantees, no invented figures, no legal or tax advice.
- Maximum 380 words. No HTML, Markdown only.`;

function buildUserMessage(data: StartPlanInput): string {
  const lines =
    data.locale === "de"
      ? [
          `Erfahrung mit Chiptuning: ${data.experience}`,
          `Betriebsart: ${data.businessType}`,
          `Verfügbare Zeit pro Woche: ${data.weeklyHours}`,
          `Geplanter Start: ${data.timeframe}`,
          `Hauptziel: ${data.goal}`,
        ]
      : [
          `Chiptuning experience: ${data.experience}`,
          `Business type: ${data.businessType}`,
          `Available time per week: ${data.weeklyHours}`,
          `Planned start: ${data.timeframe}`,
          `Main goal: ${data.goal}`,
        ];
  if (data.note) lines.push(data.locale === "de" ? `Anmerkung: ${data.note}` : `Note: ${data.note}`);
  return lines.join("\n");
}

export const generateStartPlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => startPlanSchema.parse(data))
  .handler(async ({ data }): Promise<StartPlanResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return {
        ok: false,
        error:
          data.locale === "de"
            ? "Der Plan-Service ist gerade nicht konfiguriert. Bitte versuche es später erneut."
            : "The plan service is not configured right now. Please try again later.",
      };
    }

    try {
      const { createResponsesCall } = await import("./ai/responses.server");
      const { result } = createResponsesCall(
        getRequest(),
        { apiKey, model: "openai/gpt-6-astra" },
        [{ role: "user", content: buildUserMessage(data) }],
        data.locale === "de" ? SYSTEM_DE : SYSTEM_EN,
      );
      const plan = (await result.text).trim();
      if (!plan) {
        return {
          ok: false,
          error:
            data.locale === "de"
              ? "Der Plan konnte nicht erstellt werden. Bitte versuche es erneut."
              : "The plan could not be created. Please try again.",
        };
      }
      return { ok: true, plan };
    } catch {
      return {
        ok: false,
        error:
          data.locale === "de"
            ? "Der Plan konnte gerade nicht erstellt werden. Bitte versuche es in einem Moment erneut."
            : "The plan could not be created right now. Please try again in a moment.",
      };
    }
  });
