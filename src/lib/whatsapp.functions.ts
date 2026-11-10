import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { whatsappSendSchema, withinWhatsAppWindow } from "@/lib/whatsapp";

export const getWhatsAppInbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const access = await context.supabase.rpc("can_use_whatsapp");
    if (access.error || !access.data) throw new Error("Dein Konto ist noch nicht für WhatsApp freigeschaltet.");
    const messages = await context.supabase.from("whatsapp_messages").select("*").order("created_at", { ascending: false }).limit(300);
    const account = await context.supabase.from("whatsapp_account").select("*").maybeSingle();
    if (messages.error || account.error) throw new Error("Nachrichten konnten nicht geladen werden.");
    return { messages: messages.data, account: account.data };
  });

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(whatsappSendSchema)
  .handler(async ({ context, data }) => {
    const access = await context.supabase.rpc("can_use_whatsapp");
    if (access.error || !access.data) throw new Error("Keine WhatsApp-Berechtigung.");
    const lovableKey = process.env['LOVABLE_API_KEY'];
    const connectionKey = process.env['WHATSAPP_API_KEY'];
    if (!lovableKey || !connectionKey) throw new Error("WhatsApp-Verbindung fehlt.");
    const account = await context.supabase.from("whatsapp_account").select("sending_enabled").maybeSingle();
    if (account.error) throw new Error("Kontostatus konnte nicht geprüft werden.");
    if (account.data?.sending_enabled === false) throw new Error("WhatsApp-Versand ist pausiert. Prüfe deine Verbindung in den Konnektoren.");
    const incoming = await context.supabase.from("whatsapp_messages").select("provider_time").eq("phone", data.phone).eq("direction", "inbound").order("provider_time", { ascending: false }).limit(1).maybeSingle();
    if (incoming.error) throw new Error("Antwortzeitraum konnte nicht geprüft werden.");
    if (!withinWhatsAppWindow(incoming.data?.provider_time ?? null)) throw new Error("Außerhalb des 24-Stunden-Antwortzeitraums ist eine freigegebene Vorlage erforderlich.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const reservation = await supabaseAdmin.from("whatsapp_messages").insert({ request_id: data.requestId, phone: data.phone, direction: "outbound", body: data.text, state: "sending" }).select("id").single();
    if (reservation.error) throw new Error("Versandauftrag konnte nicht gespeichert werden; derselbe Auftrag wird nicht doppelt gesendet.");
    let response: Response;
    try {
      response = await fetch("https://connector-gateway.lovable.dev/whatsapp/messages", {
        method: "POST", headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: data.phone, type: "text", text: { body: data.text } }), signal: AbortSignal.timeout(15000),
      });
    } catch {
      const saved = await supabaseAdmin.from("whatsapp_messages").update({ state: "unresolved", error: { message: "Unklarer Versandausgang" } }).eq("id", reservation.data.id);
      if (saved.error) throw new Error("Versandstatus konnte nicht gespeichert werden. Nicht erneut senden.");
      throw new Error("Versand unklar. Nicht erneut senden; prüfe den Nachrichtenstatus.");
    }
    const body = await response.text();
    if (!response.ok) {
      console.error(`WhatsApp [${response.status}]: ${body}`);
      const saved = await supabaseAdmin.from("whatsapp_messages").update({ state: "failed", error: { status: response.status, body } }).eq("id", reservation.data.id);
      if (saved.error) throw new Error("Fehlerstatus konnte nicht gespeichert werden.");
      throw new Error(`WhatsApp [${response.status}]: ${body}`);
    }
    let providerId: string | undefined;
    try { const parsed = JSON.parse(body) as { messages?: Array<{ id?: string }> }; providerId = parsed.messages?.[0]?.id; } catch { /* Remains unresolved, never blindly retry. */ }
    const saved = await supabaseAdmin.from("whatsapp_messages").update({ provider_id: providerId, state: providerId ? "accepted" : "unresolved" }).eq("id", reservation.data.id);
    if (saved.error) throw new Error("WhatsApp hat geantwortet, aber der Versandstatus konnte nicht gespeichert werden. Nicht erneut senden.");
    const reconciled = await supabaseAdmin.rpc("reconcile_whatsapp");
    if (reconciled.error) throw new Error("Nachricht angenommen; Zustellstatus konnte noch nicht abgeglichen werden.");
    if (!providerId) throw new Error("Versand unklar: WhatsApp hat keine Nachrichtenkennung zurückgegeben.");
    return { id: providerId };
  });