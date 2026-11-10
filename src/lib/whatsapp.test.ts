import { describe, expect, it } from "vitest";
import { whatsappSendSchema, withinWhatsAppWindow } from "./whatsapp";

describe("WhatsApp safeguards", () => {
  const now = Date.parse("2026-11-10T12:00:00Z");
  it("allows replies only inside 24 hours", () => {
    expect(withinWhatsAppWindow("2026-11-09T12:00:01Z", now)).toBe(true);
    expect(withinWhatsAppWindow("2026-11-09T12:00:00Z", now)).toBe(false);
    expect(withinWhatsAppWindow(null, now)).toBe(false);
    expect(withinWhatsAppWindow("2026-11-11T12:00:00Z", now)).toBe(false);
  });
  it("requires international digits and a nonempty message", () => {
    const base = { requestId: "f3bc58cd-5248-4ea5-b166-d48cfa265c57", phone: "491701234567", text: "Hallo" };
    expect(whatsappSendSchema.safeParse(base).success).toBe(true);
    expect(whatsappSendSchema.safeParse({ ...base, phone: "+491701234567" }).success).toBe(false);
    expect(whatsappSendSchema.safeParse({ ...base, text: " " }).success).toBe(false);
  });
});