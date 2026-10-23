import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/legal-page";
import { content } from "@/lib/content";
import { legalHead } from "@/lib/legal";

export const Route = createFileRoute("/datenschutz")({
  head: () => legalHead("de", "privacy"),
  component: PrivacyDe,
});

function PrivacyDe() {
  return <LegalPage c={content.de} kind="privacy" />;
}
