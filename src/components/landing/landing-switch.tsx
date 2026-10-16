import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/content";
import { LandingPageLight } from "./landing-page";
import { LandingPageDark } from "./landing-page-dark";

type Design = "light" | "dark";
const STORAGE_KEY = "tf-design";

/** Lets visitors pick between the light storytelling design and the dark original. */
export function LandingPage({ c }: { c: Content }) {
  const [design, setDesign] = useState<Design>("light");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "dark") setDesign("dark");
  }, []);

  const choose = (next: Design) => {
    localStorage.setItem(STORAGE_KEY, next);
    setDesign(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      {design === "light" ? <LandingPageLight key="light" c={c} /> : <LandingPageDark key="dark" c={c} />}
      <div
        role="radiogroup"
        aria-label={c.design.label}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-md border bg-card p-1 shadow-xl"
      >
        <Palette className="mx-1.5 size-4 text-primary" aria-hidden />
        {(["light", "dark"] as const).map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={design === d}
            onClick={() => choose(d)}
            className={cn(
              "label-caps rounded-sm px-3 py-1.5 text-xs transition-colors",
              design === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-strong",
            )}
          >
            {d === "light" ? c.design.light : c.design.dark}
          </button>
        ))}
      </div>
    </>
  );
}
