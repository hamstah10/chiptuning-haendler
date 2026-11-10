import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { integrationHead } from "@/lib/integration-head";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/login")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => integrationHead("Anmeldung für Agent-Integrationen", "Melde dich an, um eine Agent-Integration für TuningFiles zu bestätigen."),
  validateSearch: (s: Record<string, unknown>) => ({ next: oauthReturnPath(s['next']) }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function social(provider: "google" | "lovable") {
    setBusy(true); setError("");
    try {
      sessionStorage.setItem("tf-oauth-next", next);
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth/callback` });
      if (result.error) throw result.error;
      if (!result.redirected) window.location.assign(next);
    } catch { setBusy(false); setError("Anmeldung fehlgeschlagen. Versuche es erneut."); }
  }
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
    <p className="mt-3 text-sm text-muted-foreground">Melde dich an, um die Verbindung zu bestätigen. Google und Lovable können dabei ein Konto anlegen.</p>
    <div className="mt-6 grid gap-3">
      <Button variant="outline" className="h-10 gap-2.5 bg-card text-strong" disabled={busy} onClick={() => void social("google")}>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
        Weiter mit Google
      </Button>
      <Button className="lovable-auth-button h-10 w-full" disabled={busy} onClick={() => void social("lovable")}>Continue with Lovable</Button>
    </div>
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="grid gap-2"><span>E-Mail</span><Input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="grid gap-2"><span>Passwort</span><Input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button disabled={busy} type="submit"><LogIn />{busy ? "Anmelden …" : "Anmelden"}</Button>
    </form>
  </main>;
}