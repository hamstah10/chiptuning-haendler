import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";
import { content } from "@/lib/content";
import { landingHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => landingHead("de"),
  component: IndexPage,
});

function IndexPage() {
  return <LandingPage c={content.de} />;
}
