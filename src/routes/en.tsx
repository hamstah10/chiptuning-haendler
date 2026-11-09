import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-switch";
import { content } from "@/lib/content";
import { landingHead } from "@/lib/seo";

export const Route = createFileRoute("/en")({
  staticData: { sitemap: true },
  head: () => landingHead("en"),
  component: EnglishPage,
});

function EnglishPage() {
  return <LandingPage c={content.en} />;
}
