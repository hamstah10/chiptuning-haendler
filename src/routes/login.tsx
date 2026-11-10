import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { integrationHead } from "@/lib/integration-head";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => integrationHead("Anmeldung für Agent-Integrationen", "Melde dich an, um eine Agent-Integration für TuningFiles zu bestätigen."),
  validateSearch: (s: Record<string, unknown>) => ({ next: oauthReturnPath(s.next) }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      window.location.assign(next);
    } catch { setError("Anmeldung fehlgeschlagen. Prüfe deine Zugangsdaten und versuche es erneut."); setBusy(false); }
  }
  return <main className="mx-auto max-w-md px-6 py-20">
    <h1 className="text-3xl">TuningFiles Anmeldung</h1>
    <p className="mt-3 text-sm text-muted-foreground">Melde dich mit deinem bestehenden Konto an, um die Verbindung zu bestätigen.</p>
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="grid gap-2"><span>E-Mail</span><Input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="grid gap-2"><span>Passwort</span><Input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button disabled={busy} type="submit"><LogIn />{busy ? "Anmelden …" : "Anmelden"}</Button>
    </form>
  </main>;
}