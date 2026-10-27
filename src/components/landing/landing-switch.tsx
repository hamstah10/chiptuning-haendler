import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/content";
import { LandingPageLight } from "./landing-page";
import { LandingPageDark } from "./landing-page-dark";
import { SectionReview } from "./section-review";

type Design = "light" | "dark" | "mixed";
const STORAGE_KEY = "tf-design";

/** All compositions share the same content and retain the visitor's choice. */
export function LandingPage({ c }: { c: Content }) {
  const [design, setDesign] = useState<Design>("mixed");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setDesign(saved === "light" || saved === "dark" ? saved : "mixed");
  }, []);

  const choose = (next: Design) => {
    localStorage.setItem(STORAGE_KEY, next);
    setDesign(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      {design === "dark" ? (
        <LandingPageDark key="dark" c={c} />
      ) : (
        <LandingPageLight key={design} c={c} mixed={design === "mixed"} />
      )}
      <SectionReview scanKey={design} />
      <div
        role="radiogroup"
        aria-label={c.design.label}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-md border bg-card p-1 shadow-xl"
      >
        <Palette className="mx-1.5 size-4 text-primary" aria-hidden />
        {(["light", "dark", "mixed"] as const).map((d) => (
          <Button
            key={d}
            variant="ghost"
            size="sm"
            type="button"
            role="radio"
            aria-checked={design === d}
            onClick={() => choose(d)}
            className={cn(
              "label-caps rounded-sm px-2.5 py-1.5 text-xs transition-colors",
              design === d
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-strong",
            )}
          >
            {c.design[d]}
          </Button>
        ))}
      </div>
    </>
  );
}
