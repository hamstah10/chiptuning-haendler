export const LEAD_WHATSAPP_RECIPIENT = "4915228076375";
export const LEAD_WHATSAPP_TEMPLATE = "dealer_form_notification";

export interface NotificationLead {
  source: string;
  contact_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  details: unknown;
}

export function leadNotificationParameter(lead: NotificationLead): string {
  const details = lead.details && typeof lead.details === "object" && !Array.isArray(lead.details)
    ? Object.entries(lead.details).map(([key, value]) => `${key}: ${String(value)}`).join("; ") : "";
  return [
    `Formular: ${lead.source === "wizard" ? "Händleranmeldung" : "Konfigurator"}`,
    `Name: ${lead.contact_name}`,
    lead.company ? `Firma: ${lead.company}` : "",
    lead.email ? `E-Mail: ${lead.email}` : "",
    lead.phone ? `Telefon: ${lead.phone}` : "",
    details,
  ].filter(Boolean).join("; ").replace(/\s+/g, " ").trim().slice(0, 900);
}

export function leadTemplateApproved(body: unknown): boolean {
  if (!body || typeof body !== "object" || !("data" in body) || !Array.isArray(body.data)) return false;
  return body.data.some((template: unknown) => {
    if (!template || typeof template !== "object") return false;
    const item = template as { name?: string; status?: string; language?: string };
    return item.name === LEAD_WHATSAPP_TEMPLATE && item.status === "APPROVED" && item.language === "de";
  });
}