import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { integrationHead } from "@/lib/integration-head";

export const Route = createFileRoute("/auth/callback")({
  staticData: { sitemap: false }, ssr: false,
  head: () => integrationHead("Anmeldung bestätigen", "TuningFiles Anmeldung abschließen und zur Verbindungsanfrage zurückkehren."),
  component: Callback,
});
function Callback() {
  const [error, setError] = useState(false);
  useEffect(() => {
    const finish = () => {
      const next = oauthReturnPath(sessionStorage.getItem("tf-oauth-next"));
      sessionStorage.removeItem("tf-oauth-next");
      window.location.assign(next);
    };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { if (session) finish(); });
    void supabase.auth.getSession().then(({ data }) => { if (data.session) finish(); });
    const timer = window.setTimeout(() => setError(true), 15000);
    return () => { data.subscription.unsubscribe(); window.clearTimeout(timer); };
  }, []);
  return <main className="mx-auto max-w-lg px-6 py-20" role="status">{error ? "Anmeldung nicht abgeschlossen. Starte die Verbindung erneut." : "Anmeldung wird abgeschlossen …"}</main>;
}