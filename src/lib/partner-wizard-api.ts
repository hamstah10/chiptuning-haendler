/**
 * DCT Partner Wizard headless API (portal.dct-files.de).
 * Public client config — no token required for client "no1".
 */

const API_BASE = "https://portal.dct-files.de";
export const PARTNER_WIZARD_CLIENT = "no1";

export interface WizardOption {
  value: string | null;
  id: number | null;
  title: string | null;
  name?: string | null;
  text: string | null;
  icon: string | null;
  imageUrl: string | null;
}

export interface WizardQuestion {
  answerKey: string;
  title: string;
  helpText: string | null;
  questionType: "generic" | "vehicleType" | "toolManufacturer";
  multiSelect: boolean;
  fieldType: "text" | "email" | "textarea" | "checkbox" | null;
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
  toolDirection: string;
  nextStep: string;
  estimatedMonthlyRevenue: number | null;
  disclaimer: string;
}

export type WizardAnswers = Record<string, string | string[] | number[]>;

/** Maps collected answers to the fixed field names the recommend/leads API expects. */
export function buildWizardRequest(answers: WizardAnswers) {
  const vehicles = (answers["vehicles"] as number[] | undefined) ?? [];
  return {
    clientId: PARTNER_WIZARD_CLIENT,
    goal: (answers["goal"] as string) || undefined,
    experience: (answers["experience"] as string) || undefined,
    vehicleCategories: vehicles,
    mainVehicleCategory: vehicles[0],
    currentTool: (answers["tool"] as string) || undefined,
    services: (answers["services"] as string[] | undefined) ?? [],
    website: (answers["website"] as string) || undefined,
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export async function fetchWizardConfig(): Promise<WizardConfig> {
  const res = await fetch(`${API_BASE}/api/tfd-partner-wizard/config/${PARTNER_WIZARD_CLIENT}`);
  if (!res.ok) throw new Error(`Config failed (${res.status})`);
  return res.json();
}

export function fetchWizardRecommendation(answers: WizardAnswers): Promise<WizardRecommendation> {
  return postJson("/api/tfd-partner-wizard/recommend", buildWizardRequest(answers));
}

export interface WizardContact {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}

export function submitWizardLead(answers: WizardAnswers, contact: WizardContact) {
  return postJson<{ ok: boolean; id: number; message: string }>("/api/tfd-partner-wizard/leads", {
    ...buildWizardRequest(answers),
    contact,
    privacyAccepted: true,
    source: "chiptuning-company-website",
    website_confirm: "",
    answers,
  });
}
