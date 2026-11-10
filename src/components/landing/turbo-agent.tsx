import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useState } from "react";
import { Mic, PhoneOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const labels = {
  de: { open: "Mit Turbo sprechen", close: "Schließen", start: "Gespräch starten", stop: "Beenden", connecting: "Verbindung …", ready: "Bereit", listening: "Turbo hört zu", speaking: "Turbo spricht", notice: "Für das Gespräch wird dein Mikrofon verwendet und deine Stimme an ElevenLabs übertragen.", error: "Das Gespräch konnte nicht gestartet werden. Prüfe Mikrofonzugriff und Verbindung." },
  en: { open: "Talk to Turbo", close: "Close", start: "Start conversation", stop: "End", connecting: "Connecting …", ready: "Ready", listening: "Turbo is listening", speaking: "Turbo is speaking", notice: "This conversation uses your microphone and sends your voice to ElevenLabs.", error: "The conversation could not start. Check microphone access and connection." },
};

export default function TurboAgent({ locale }: { locale: "de" | "en" }) {
  return <ConversationProvider><TurboControls locale={locale} /></ConversationProvider>;
}

function TurboControls({ locale }: { locale: "de" | "en" }) {
  const t = labels[locale];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const conversation = useConversation({
    onError: () => { setError(t.error); setBusy(false); },
    onConnect: () => setBusy(false),
    onDisconnect: () => setBusy(false),
  });
  const connected = conversation.status === "connected";
  async function start() {
    setBusy(true); setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      await conversation.startSession({ agentId: "agent_0201m721fk54f4gbae2bdjw7rc0j", connectionType: "webrtc" });
    } catch { setError(t.error); }
    finally { setBusy(false); }
  }
  async function close() {
    await conversation.endSession();
    setOpen(false); setError("");
  }
  return <div className="fixed bottom-20 right-4 z-50 max-w-80">
    {open ? <section aria-label="Turbo" className="rounded-md border border-border bg-card p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-6"><h2 className="text-2xl text-strong">Turbo</h2><Button variant="ghost" size="icon" aria-label={t.close} title={t.close} disabled={busy} onClick={() => void close()}><X className="size-4" /></Button></div>
      <p className="mb-4 text-sm text-muted-foreground">{t.notice}</p>
      <p aria-live="polite" className="mb-4 text-sm font-medium text-strong">{busy ? t.connecting : connected ? conversation.isSpeaking ? t.speaking : t.listening : t.ready}</p>
      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
      {connected ? <Button variant="outline" onClick={() => void conversation.endSession()}><PhoneOff className="size-4" />{t.stop}</Button> : <Button disabled={busy} onClick={() => void start()}><Mic className="size-4" />{busy ? t.connecting : t.start}</Button>}
    </section> : <Button className="gap-2 shadow-lg" onClick={() => setOpen(true)}><Mic className="size-4" />{t.open}</Button>}
  </div>;
}