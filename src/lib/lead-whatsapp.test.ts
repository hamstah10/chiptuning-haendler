import { describe, expect, it } from "vitest";
import { LEAD_WHATSAPP_RECIPIENT, leadNotificationParameter, leadTemplateApproved } from "./lead-whatsapp";

describe("owner lead notifications", () => {
  it("only addresses the owner's chosen number, not the visitor", () => {
    expect(LEAD_WHATSAPP_RECIPIENT).toBe("4915228076375");
  });
  it("includes submitted contacts and details for both lead forms", () => {
    for (const source of ["wizard", "configurator"]) {
      const text = leadNotificationParameter({ source, contact_name: "Test Owner", company: "Test", email: "test@example.org", phone: "491701234567", details: { engine: "Chosen engine" } });
      expect(text).toContain("test@example.org");
      expect(text).toContain("engine: Chosen engine");
    }
  });
  it("sends only the approved German notification template", () => {
    expect(leadTemplateApproved({ data: [{ name: "dealer_form_notification", language: "de", status: "PENDING" }] })).toBe(false);
    expect(leadTemplateApproved({ data: [{ name: "dealer_form_notification", language: "de", status: "APPROVED" }] })).toBe(true);
    expect(leadTemplateApproved({ data: [{ name: "other", language: "de", status: "APPROVED" }] })).toBe(false);
  });
});