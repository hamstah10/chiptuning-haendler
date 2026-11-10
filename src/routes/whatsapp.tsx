import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LogIn, MessageCircle, RefreshCw, Search, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWhatsAppInbox, sendWhatsAppMessage } from "@/lib/whatsapp.functions";
import { whatsappStateLabels, withinWhatsAppWindow } from "@/lib/whatsapp";
import { integrationHead } from "@/lib/integration-head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/whatsapp")({
  staticData: { sitemap: false },
  head: () => integrationHead("WhatsApp Nachrichten", "Geschützte WhatsApp-Business-Nachrichten für TuningFiles."),
  component: WhatsApp,
});

function WhatsApp() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSignedIn(Boolean(data.session)); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setSignedIn(Boolean(session)); });
    return () => data.subscription.unsubscribe();
  }, []);
  const inbox = useQuery({ queryKey: ["whatsapp-inbox"], queryFn: () => getWhatsAppInbox(), enabled: signedIn, refetchInterval: 10000, retry: false });
  const messages = inbox.data?.messages ?? [];
  const conversations = useMemo(() => {
    const unique = new Map<string, typeof messages[number]>();
    for (const message of messages) if (!unique.has(message.phone)) unique.set(message.phone, message);
    return [...unique.values()].filter(message => `${message.phone} ${message.body}`.toLowerCase().includes(search.toLowerCase()));
  }, [messages, search]);
  const selected = phone || conversations[0]?.phone || "";
  const thread = messages.filter(message => message.phone === selected).reverse();
  const lastInbound = messages.find(message => message.phone === selected && message.direction === "inbound");
  const canReply = withinWhatsAppWindow(lastInbound?.provider_time ?? null) && inbox.data?.account?.sending_enabled !== false;
  const text = drafts[selected] ?? "";
  async function send() {
    setBusy(true); setError("");
    try {
      await sendWhatsAppMessage({ data: { requestId: crypto.randomUUID(), phone: selected, text } });
      setDrafts(current => ({ ...current, [selected]: "" }));
    } catch (e) { setError(e instanceof Error ? e.message : "Nachricht konnte nicht gesendet werden."); }
    finally { setBusy(false); void queryClient.invalidateQueries({ queryKey: ["whatsapp-inbox"] }); }
  }
  return <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3"><MessageCircle className="size-7 text-primary" /><h1 className="text-3xl">WhatsApp</h1></div>
      <div className="flex gap-2"><Button variant="outline" asChild><a href="/"><ArrowLeft /> Zur Website</a></Button>{signedIn && <Button variant="outline" onClick={() => void inbox.refetch()} aria-label="Nachrichten aktualisieren" title="Aktualisieren"><RefreshCw className={cn("size-4", inbox.isFetching && "animate-spin")} /></Button>}</div>
    </header>
    {!ready ? <p className="text-muted-foreground">Wird geladen …</p> : !signedIn ? <div className="py-12"><h2 className="text-2xl">Geschäftliche Nachrichten</h2><p className="my-4 text-muted-foreground">Nur für freigeschaltete Konten.</p><Button asChild><a href="/login?next=%2Fwhatsapp"><LogIn /> Anmelden</a></Button></div> : inbox.isError ? <div role="alert" className="py-8 text-destructive">{inbox.error.message}</div> : <>
      {inbox.data?.account?.sending_enabled === false && <p role="alert" className="mb-4 text-destructive">Versand pausiert: {inbox.data.account.event}. Prüfe die WhatsApp-Verbindung.</p>}
      <div className="grid min-h-96 overflow-hidden rounded-md border border-border bg-card md:grid-cols-3">
        <aside className="border-b border-border md:border-r md:border-b-0">
          <div className="flex items-center gap-2 border-b border-border p-4"><Search className="size-4 text-muted-foreground" /><Input aria-label="Chats durchsuchen" placeholder="Chats durchsuchen" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="max-h-80 overflow-y-auto md:max-h-none">{conversations.length === 0 ? <p className="p-5 text-sm text-muted-foreground">Noch keine Nachrichten.</p> : conversations.map(message => <Button key={message.phone} variant="ghost" className={cn("h-auto w-full justify-start rounded-none border-b border-border px-4 py-4 text-left", selected === message.phone && "bg-accent")} onClick={() => { setPhone(message.phone); setError(""); }}><div className="min-w-0"><p className="font-mono tabular-nums">+{message.phone}</p><p className="max-w-56 truncate text-sm text-muted-foreground">{message.body || message.kind}</p></div></Button>)}</div>
        </aside>
        <section className="flex min-w-0 flex-col md:col-span-2">
          <div className="border-b border-border px-5 py-4 font-mono">{selected ? `+${selected}` : "Nachrichten"}</div>
          <div className="flex max-h-96 min-h-80 flex-col gap-4 overflow-y-auto p-5 md:max-h-144">{thread.length === 0 ? <p className="m-auto text-sm text-muted-foreground">Kein Chat ausgewählt.</p> : thread.map(message => <article key={message.id} className={cn("max-w-full rounded-md border border-border px-4 py-3 md:max-w-5/6", message.direction === "outbound" ? "self-end bg-primary-soft" : "self-start bg-sunken")}><p className="whitespace-pre-wrap break-words">{message.body || `[${message.kind}]`}</p>{message.media_id && <p className="mt-2 text-xs text-muted-foreground">Mediennachricht empfangen</p>}<div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground"><time>{new Date(message.provider_time ?? message.created_at).toLocaleString("de-DE")}</time><span>{whatsappStateLabels[message.state] ?? message.state}</span></div>{message.error && <p className="mt-2 break-words text-xs text-destructive">{JSON.stringify(message.error)}</p>}</article>)}</div>
          <form className="mt-auto grid gap-3 border-t border-border p-4" onSubmit={e => { e.preventDefault(); void send(); }}>
            {selected && !canReply && <p className="text-sm text-muted-foreground">Der 24-Stunden-Antwortzeitraum ist geschlossen. Eine freigegebene Vorlage ist erforderlich.</p>}
            <Textarea aria-label="Nachricht" placeholder="Nachricht" maxLength={4096} value={text} disabled={!canReply || busy} onChange={e => setDrafts(current => ({ ...current, [selected]: e.target.value }))} />
            {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
            <Button type="submit" className="justify-self-end" disabled={!canReply || busy || !text.trim()}><Send />{busy ? "Wird gesendet …" : "Senden"}</Button>
          </form>
        </section>
      </div>
    </>}
  </main>;
}