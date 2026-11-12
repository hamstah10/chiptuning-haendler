/**
 * DCT Partner Wizard headless API (portal.dct-files.de).
 * Public client config — no token required for client "tfd".
 */

export const PARTNER_WIZARD_CLIENT = "tfd";

export interface WizardOption {
  value: string | null;
  id: number | null;
  title: string | null;
  name?: string | null;
  text: string | null;
  icon: string | null;
  imageUrl: string | null;
  optionId?: number | null;
  numericValue?: number | null;
}

export interface WizardQuestion {
  answerKey: string;
  title: string;
  helpText: string | null;
  questionType: "generic" | "vehicleType" | "toolManufacturer" | "service" | "volume";
  multiSelect: boolean;
  fieldType: "text" | "email" | "textarea" | "checkbox" | "select" | "radio" | null;
  required: boolean;
  dependsOnAnswerKey: string | null;
  dependsOnValue: string | null;
  options: WizardOption[];
}

export interface WizardStep {
  key: string;
  label: string;
  type: "questions" | "recommendation" | "contact";
  questions: WizardQuestion[];
}

export interface WizardConfig {
  clientId: string;
  name: string;
  headline: string;
  introText: string;
  primaryColor: string;
  toolRequired: boolean;
  defaultVehiclePrice: number;
  privacyNotice: string;
  appointment?: { enabled: boolean; required: boolean; title: string; durationMinutes: number; timezone: string } | null;
  toolDisclaimer: string;
  steps: WizardStep[];
}

export interface WizardToolProduct {
  uid: number;
  title: string;
  sku: string;
  price: string;
  specialPrice: string | null;
  slug: string;
  imageUrl: string | null;
}

export interface WizardRecommendedTool {
  key: string;
  name: string;
  description: string;
  level: string;
  score: number;
  imageUrl: string | null;
  product: WizardToolProduct | null;
}

export interface WizardRecommendation {
  status: "ready" | "tool_required";
  packageKey: string;
  packageTitle: string;
  packageText: string;
  packageFeatures: string[];
  recommendedTools: WizardRecommendedTool[];
  recommendedProducts: WizardToolProduct[];
  toolDirection: string;
  nextStep: string;
  estimatedMonthlyRevenue: number | null;
  disclaimer: string;
}

export type WizardAnswers = Record<string, string | string[] | number[]>;

/** Maps collected answers to the fixed field names the recommend/leads API expects. */
let knownQuestions: WizardQuestion[] = [];

/** Answer key of the first question with the given portal type, falling back to the standard key. */
const keyFor = (type: WizardQuestion["questionType"], fallback: string) =>
  knownQuestions.find((q) => q.questionType === type)?.answerKey ?? fallback;

export function buildWizardRequest(answers: WizardAnswers) {
  const vehicles = ((answers[keyFor("vehicleType", "vehicles")] as number[] | undefined) ?? []).map(Number);
  const volumeQ = knownQuestions.find((q) => q.questionType === "volume");
  const volumeValue = volumeQ ? String(answers[volumeQ.answerKey] ?? "") : "";
  const monthly = volumeQ?.options.find((o) => o.value === volumeValue)?.numericValue;
  const level = answers["desiredToolLevel"] as string | undefined;
  return {
    clientId: PARTNER_WIZARD_CLIENT,
    goal: (Array.isArray(answers["goal"]) ? String(answers["goal"][0] ?? "") : (answers["goal"] as string)) || undefined,
    experience: (answers["experience"] as string) || undefined,
    vehicleCategories: vehicles,
    mainVehicleCategory: vehicles[0],
    currentTool: (answers[keyFor("toolManufacturer", "tool")] as string) || undefined,
    services: (answers[keyFor("service", "services")] as string[] | undefined) ?? [],
    ...(typeof monthly === "number" ? { monthlyVehicleCount: monthly } : {}),
    ...(level === "slave" || level === "master" || level === "unknown" ? { desiredToolLevel: level } : {}),
    website: (answers["website"] as string) || undefined,
  };
}

async function proxy<T>(path: string, body?: unknown): Promise<T> {
  const { partnerWizardProxy } = await import("./partner-wizard.functions");
  const res = await partnerWizardProxy({ data: { path, body } });
  const data = JSON.parse(res.json) as Record<string, unknown>;
  if (!res.ok) throw new Error(typeof data["error"] === "string" ? data["error"] : `Request failed (${res.status})`);
  return data as T;
}
const postJson = <T,>(path: string, body: unknown) => proxy<T>(path, body);

export async function fetchWizardConfig(): Promise<WizardConfig> {
  const config = await proxy<WizardConfig>(`/api/tfd-partner-wizard/config/${PARTNER_WIZARD_CLIENT}`);
  knownQuestions = config.steps.flatMap((s) => s.questions);
  return config;
}

export function fetchWizardRecommendation(answers: WizardAnswers): Promise<WizardRecommendation> {
  return postJson("/api/tfd-partner-wizard/recommend", buildWizardRequest(answers));
}

export interface WizardSlot { start: string; end: string; time: string }
export interface WizardDay { date: string; weekday: number; slots: WizardSlot[] }

export async function fetchWizardAppointments(): Promise<WizardDay[]> {
  const data = await proxy<{ days?: WizardDay[] }>(`/api/tfd-partner-wizard/appointments/${PARTNER_WIZARD_CLIENT}`);
  return (data.days ?? []).filter((d) => d.slots?.length);
}

export type WizardContact = Record<string, string | boolean | string[]>;

export async function submitWizardLead(answers: WizardAnswers, contact: WizardContact, appointmentStart?: string) {
  const { submitPartnerWizardLead } = await import("./partner-wizard.functions");
  const result = await submitPartnerWizardLead({ data: {
    ...buildWizardRequest(answers),
    contact,
    name: contact["name"], company: contact["company"], email: contact["email"], phone: contact["phone"], message: contact["message"],
    privacyAccepted: contact["privacyAccepted"] === true,
    source: "chiptuning-company-website",
    website_confirm: "",
    answers: { ...answers, contact, privacyAccepted: contact["privacyAccepted"] === true },
    ...(appointmentStart ? { appointment: { start: appointmentStart } } : {}),
  } });
  if (!result.ok) throw new WizardSubmitError(result.status, result.message);
  return result;
}

export class WizardSubmitError extends Error {
  constructor(public status: number, message: string) {
    super(message || `Request failed (${status})`);
  }
}
