import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/legal-page";
import { content } from "@/lib/content";
import { legalHead } from "@/lib/legal";

export const Route = createFileRoute("/en_/privacy")({
  staticData: { sitemap: true },
  head: () => legalHead("en", "privacy"),
  component: PrivacyEn,
});

function PrivacyEn() {
  return <LegalPage c={content.en} kind="privacy" />;
}
