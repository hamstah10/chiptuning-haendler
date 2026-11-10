import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { integrationHead } from "@/lib/integration-head";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => integrationHead("Agent-Verbindung bestätigen", "Bestätige oder verweigere den Zugriff eines Agenten auf TuningFiles."),
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "" }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Die Verbindungsanfrage fehlt oder ist abgelaufen.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) throw redirect({ to: "/login", search: { next: location.pathname + location.searchStr } });
    return { email: data.session.user.email ?? "" };
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Die Verbindungsanfrage fehlt.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error) throw error;
    if (data && "redirect_url" in data) throw redirect({ href: data.redirect_url });
    return data;
  },
  pendingComponent: () => <main className="mx-auto max-w-lg px-6 py-20" role="status">Verbindungsanfrage wird geladen …</main>,
  errorComponent: () => <main className="mx-auto max-w-lg px-6 py-20"><h1 className="text-3xl">Verbindung nicht verfügbar</h1><p role="alert" className="mt-4 text-muted-foreground">Die Anfrage konnte nicht geladen werden. Starte die Verbindung in deinem Agenten erneut.</p></main>,
  component: Consent,
});

function Consent() {
  const details = Route.useLoaderData();
  const { email } = Route.useRouteContext();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function decide(approve: boolean) {
    setBusy(true); setError("");
    try {
      const result = approve ? await supabase.auth.oauth.approveAuthorization(authorization_id) : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (result.error) throw result.error;
      const target = result.data?.redirect_url;
      if (!target) throw new Error("Missing redirect");
      window.location.assign(target);
    } catch { setBusy(false); setError("Die Entscheidung konnte nicht gespeichert werden. Versuche es erneut."); }
  }
  return <main className="mx-auto max-w-lg px-6 py-20">
    <h1 className="text-3xl">{details?.client.name ?? "Agent"} mit TuningFiles verbinden</h1>
    <p className="mt-4 text-sm text-muted-foreground">Angemeldet als {email}</p>
    <Button variant="link" disabled={busy} className="px-0" onClick={async () => { await supabase.auth.signOut(); window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}>Anderes Konto verwenden</Button>
    <p className="mt-5">Die Verbindung erlaubt das Lesen der Händler-Pakete und unverbindliche Verdienstberechnungen.</p>
    <p className="mt-3 break-all text-sm text-muted-foreground">Ziel: {details?.redirect_uri}</p>
    <p className="mt-3 text-sm">Angefragte Identitätsfreigaben: {details?.scope || "Keine zusätzlichen Angaben"}</p>
    <p className="mt-4 text-sm text-muted-foreground">Anfragen, Notizen und gespeicherte Startpläne werden nicht freigegeben. Die bestehenden Zugriffsrechte gelten weiterhin.</p>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-8 flex gap-3"><Button disabled={busy} onClick={() => void decide(true)}>Verbindung erlauben</Button><Button variant="outline" disabled={busy} onClick={() => void decide(false)}>Ablehnen</Button></div>
  </main>;
}