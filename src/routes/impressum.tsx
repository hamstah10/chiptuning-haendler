import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/legal-page";
import { content } from "@/lib/content";
import { legalHead } from "@/lib/legal";

export const Route = createFileRoute("/impressum")({
  staticData: { sitemap: true },
  head: () => legalHead("de", "imprint"),
  component: ImprintDe,
});

function ImprintDe() {
  return <LegalPage c={content.de} kind="imprint" />;
}
