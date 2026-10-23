import { createFileRoute } from "@tanstack/react-router";
import { StartPlanPage } from "@/components/landing/start-plan-page";
import { content } from "@/lib/content";
import { startPlanHead } from "@/lib/seo";

export const Route = createFileRoute("/startplan")({
  head: () => startPlanHead("de"),
  component: StartPlanRouteDe,
});

function StartPlanRouteDe() {
  return <StartPlanPage c={content.de} />;
}
