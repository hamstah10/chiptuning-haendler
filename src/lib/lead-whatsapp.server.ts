import { LEAD_WHATSAPP_RECIPIENT, LEAD_WHATSAPP_TEMPLATE, leadNotificationParameter, leadTemplateApproved } from "./lead-whatsapp";

// Imported only inside server handlers. Pending jobs are durable and picked up
// by later submissions or signed callbacks; quiet periods delay recovery.
export async function processLeadWhatsAppNotifications(sendTimeoutMs = 15000) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const key = process.env['LOVABLE_API_KEY'];
  const connection = process.env['WHATSAPP_API_KEY'];
  if (!key || !connection) throw new Error("WhatsApp-Verbindung fehlt.");
  const gateway = "https://connector-gateway.lovable.dev/whatsapp";
  const headers = { Authorization: `Bearer ${key}`, "X-Connection-Api-Key": connection, "Content-Type": "application/json" };
  const jobs = await supabaseAdmin.from("whatsapp_messages").select("id,lead_id").eq("state", "pending_template").not("lead_id", "is", null).order("created_at").limit(1);
  if (jobs.error) throw new Error("Benachrichtigungen konnten nicht geladen werden.");
  if (!jobs.data.length) return;
  const account = await supabaseAdmin.from("whatsapp_account").select("sending_enabled").maybeSingle();
  if (account.error) throw new Error("WhatsApp-Kontostatus konnte nicht geladen werden.");
  if (account.data?.sending_enabled === false) return;
  const templates = await fetch(`${gateway}/message_templates?name=${LEAD_WHATSAPP_TEMPLATE}&limit=100`, { headers, signal: AbortSignal.timeout(1000) });
  if (!templates.ok) {
    const text = await templates.text();
    console.error(`WhatsApp templates [${templates.status}]: ${text}`);
    throw new Error(`WhatsApp [${templates.status}]: ${text}`);
  }
  if (!leadTemplateApproved(await templates.json())) return;
  for (const job of jobs.data) {
    if (!job.lead_id) continue;
    const lead = await supabaseAdmin.from("dealer_leads").select("source,contact_name,company,email,phone,details").eq("id", job.lead_id).single();
    if (lead.error) throw new Error("Anfrage konnte nicht geladen werden.");
    const parameter = leadNotificationParameter(lead.data);
    const claimed = await supabaseAdmin.from("whatsapp_messages").update({ state: "unresolved", body: parameter }).eq("id", job.id).eq("state", "pending_template").select("id").maybeSingle();
    if (claimed.error) throw new Error("Versandauftrag konnte nicht reserviert werden.");
    if (!claimed.data) continue;
    // The reservation is already unresolved before network I/O, so an interrupted
    // worker cannot accidentally resend a possibly accepted notification.
    let response: Response;
    try {
      response = await fetch(`${gateway}/messages`, {
        method: "POST", headers, signal: AbortSignal.timeout(sendTimeoutMs),
        body: JSON.stringify({ messaging_product: "whatsapp", to: LEAD_WHATSAPP_RECIPIENT, type: "template", template: { name: LEAD_WHATSAPP_TEMPLATE, language: { code: "de" }, components: [{ type: "body", parameters: [{ type: "text", text: parameter }] }] } }),
      });
    } catch {
      const saved = await supabaseAdmin.from("whatsapp_messages").update({ error: { message: "Versandausgang unklar; nicht automatisch erneut senden." } }).eq("id", job.id);
      if (saved.error) throw new Error("Unklarer Versandstatus konnte nicht gespeichert werden.");
      continue;
    }
    const text = await response.text();
    if (!response.ok) {
      console.error(`WhatsApp [${response.status}]: ${text}`);
      const saved = await supabaseAdmin.from("whatsapp_messages").update({ state: "failed", error: { status: response.status, body: text } }).eq("id", job.id);
      if (saved.error) throw new Error("Versandfehler konnte nicht gespeichert werden.");
      continue;
    }
    let providerId: string | null = null;
    try {
      const parsed = JSON.parse(text) as { messages?: Array<{ id?: string }> };
      providerId = parsed.messages?.[0]?.id ?? null;
    } catch { /* Remain unresolved for operator review. */ }
    const saved = await supabaseAdmin.from("whatsapp_messages").update({ provider_id: providerId, state: providerId ? "accepted" : "unresolved" }).eq("id", job.id);
    if (saved.error) throw new Error("Versandstatus konnte nicht gespeichert werden.");
    const reconciled = await supabaseAdmin.rpc("reconcile_whatsapp");
    if (reconciled.error) throw new Error("Zustellstatus konnte nicht abgeglichen werden.");
  }
}