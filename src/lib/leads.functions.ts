import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { TablesInsert } from "@/integrations/supabase/types";

const detailsSchema = z
  .record(z.string(), z.string().max(300))
  .refine((value) => Object.keys(value).length <= 25, { message: "Too many details" });

const locale = z.enum(["de", "en"]);
const name = z.string().trim().min(2).max(120);

export const leadSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("wizard"),
    locale,
    company: z.string().trim().min(2).max(150),
    contactName: name,
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(5).max(40),
    details: detailsSchema,
  }),
  z.object({
    source: z.literal("configurator"),
    locale,
    contactName: name,
    contact: z.string().trim().min(5).max(255),
    details: detailsSchema,
  }),
]);

export type LeadInput = z.infer<typeof leadSchema>;

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const isEmail = data.source === "configurator" && data.contact.includes("@");
    const row: TablesInsert<"dealer_leads"> =
      data.source === "wizard"
        ? {
            source: data.source,
            locale: data.locale,
            company: data.company,
            contact_name: data.contactName,
            email: data.email,
            phone: data.phone,
            details: data.details,
          }
        : {
            source: data.source,
            locale: data.locale,
            contact_name: data.contactName,
            email: isEmail ? data.contact : null,
            phone: isEmail ? null : data.contact,
            details: data.details,
          };

    const { data: saved, error } = await supabaseAdmin.from("dealer_leads").insert(row).select("id").single();
    if (error) throw new Error("Lead could not be saved");
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("lead-notification", "hamstahstudio@gmail.com", {
        idempotencyKey: `lead-notification-${saved.id}`,
        templateData: {
          form: data.source === "wizard" ? "Partner-Wizard" : "Konfigurator",
          name: row.contact_name,
          company: row.company ?? undefined,
          email: row.email ?? undefined,
          phone: row.phone ?? undefined,
          details: Object.entries(data.details).map(([key, value]) => ({ key, value })),
        },
      });
    } catch (mailError) {
      console.error("Stored lead; email notification failed:", mailError);
    }
    // The database trigger queues notification atomically with the lead.
    // Notification failures must never make a saved enquiry look unsuccessful.
    try {
      const { processLeadWhatsAppNotifications } = await import("./lead-whatsapp.server");
      await processLeadWhatsAppNotifications();
    } catch (error) {
      console.error("Stored lead; WhatsApp notification pending:", error);
    }
    return { ok: true as const };
  });
