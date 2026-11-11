import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { Content } from "@/lib/content";
import { LandingPageLight } from "./landing-page";
import { LandingPageDark } from "./landing-page-dark";
import { SectionReview } from "./section-review";

type Design = "light" | "dark" | "mixed";
const STORAGE_KEY = "tf-design";
const REVIEW_KEY = "tf-review-enabled";
const TurboAgent = lazy(() => import("./turbo-agent"));

/** All compositions share the same content and retain the visitor's choice. */
export function LandingPage({ c }: { c: Content }) {
  const [design, setDesign] = useState<Design>("mixed");
  const [reviewEnabled, setReviewEnabled] = useState(false);

  useEffect(() => {
    // Switch removed from the page; ?design=light|dark still previews alternatives.
    const param = new URLSearchParams(window.location.search).get("design");
    localStorage.removeItem(STORAGE_KEY);
    setDesign(param === "light" || param === "dark" ? param : "mixed");
    // Review tool is hidden unless unlocked via ?review=1 (remembered); ?review=0 locks it again.
    const reviewParam = new URLSearchParams(window.location.search).get("review");
    if (reviewParam === "1") localStorage.setItem(REVIEW_KEY, "1");
    if (reviewParam === "0") localStorage.removeItem(REVIEW_KEY);
    setReviewEnabled(localStorage.getItem(REVIEW_KEY) === "1");
  }, []);

  return (
    <>
      {design === "dark" ? (
        <LandingPageDark key="dark" c={c} />
      ) : (
        <LandingPageLight key={design} c={c} mixed={design === "mixed"} />
      )}
      {reviewEnabled && <SectionReview scanKey={design} />}
      <ClientOnly><Suspense fallback={null}><TurboAgent locale={c.locale} /></Suspense></ClientOnly>
    </>
  );
}
