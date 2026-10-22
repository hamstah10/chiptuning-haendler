import { createFileRoute } from "@tanstack/react-router";
import { StartPlanPage } from "@/components/landing/start-plan-page";
import { content } from "@/lib/content";
import { startPlanHead } from "@/lib/seo";

export const Route = createFileRoute("/en/startplan")({
  head: () => startPlanHead("en"),
  component: StartPlanRouteEn,
});

function StartPlanRouteEn() {
  return <StartPlanPage c={content.en} />;
}
