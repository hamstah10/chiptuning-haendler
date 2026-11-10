import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env['WHATSAPP_API_KEY'];
    if (!secret) return new Response("Connection unavailable", { status: 503 });
    const delivery = request.headers.get("X-Lovable-Delivery");
    const event = request.headers.get("X-Lovable-Event");
    if (!delivery?.trim() || !event?.trim()) return new Response("Missing headers", { status: 400 });
    let payload: Json;
    try { payload = (await verifyWebhookRequest<Json>({ req: request, secret, maxBodyBytes: 4 * 1024 * 1024 })).payload; }
    catch { return new Response("Invalid signature or payload", { status: 401 }); }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stored = await supabaseAdmin.from("whatsapp_webhook_events").insert({ delivery_id: delivery, event, payload });
    if (stored.error && stored.error.code !== "23505") return new Response("Storage failed", { status: 503 });
    // Every delivery also resumes a bounded, fairly scheduled batch of unfinished work.
    const processed = await supabaseAdmin.rpc("process_whatsapp_events");
    if (processed.error) return new Response("Processing failed", { status: 503 });
    const current = await supabaseAdmin.from("whatsapp_webhook_events").select("processing_error,processed_at").eq("delivery_id", delivery).single();
    if (current.error || current.data.processing_error) return new Response("Processing pending", { status: 503 });
    try {
      const { processLeadWhatsAppNotifications } = await import("@/lib/lead-whatsapp.server");
      await processLeadWhatsAppNotifications();
    } catch (error) {
      console.error("Lead notification recovery pending:", error);
    }
    return Response.json({ received: true });
  } } },
});