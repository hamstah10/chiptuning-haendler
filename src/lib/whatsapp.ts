import { z } from "zod";

export const whatsappSendSchema = z.object({
  requestId: z.uuid(),
  phone: z.string().regex(/^[1-9]\d{6,14}$/, "Telefonnummer im internationalen Format ohne + eingeben."),
  text: z.string().trim().min(1).max(4096),
});

export function withinWhatsAppWindow(timestamp: string | null, now = Date.now()) {
  if (!timestamp) return false;
  const time = Date.parse(timestamp);
  return Number.isFinite(time) && time <= now && now - time < 24 * 60 * 60 * 1000;
}

export const whatsappStateLabels: Record<string, string> = {
  received: "Empfangen", sending: "Wird gesendet", accepted: "Angenommen",
  sent: "Gesendet", delivered: "Zugestellt", read: "Gelesen", failed: "Fehlgeschlagen",
  unresolved: "Versand unklar – nicht erneut senden",
};