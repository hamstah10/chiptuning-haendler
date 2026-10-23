import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/legal-page";
import { content } from "@/lib/content";
import { legalHead } from "@/lib/legal";

export const Route = createFileRoute("/en_/imprint")({
  head: () => legalHead("en", "imprint"),
  component: ImprintEn,
});

function ImprintEn() {
  return <LegalPage c={content.en} kind="imprint" />;
}
