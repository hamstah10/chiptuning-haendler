import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardCheck, Copy, Eye, EyeOff, MessageSquare, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Decision = "ja" | "nein" | "vielleicht";
type Review = { decision?: Decision; comment: string; note?: string };
type Target = { id: string; title: string; el: HTMLElement };

const saveTimers: Record<string, number> = {};
const STORAGE_KEY = "tf-section-review";
const VISIBLE_KEY = "tf-section-review-visible";

const DECISIONS: { value: Decision; label: string; active: string; dot: string }[] = [
  { value: "ja", label: "Ja", active: "border-success bg-success text-primary-foreground! hover:bg-success", dot: "bg-success" },
  { value: "nein", label: "Nein", active: "border-primary bg-primary text-primary-foreground! hover:bg-primary", dot: "bg-primary" },
  { value: "vielleicht", label: "Vielleicht", active: "border-strong bg-strong text-primary-foreground! hover:bg-strong", dot: "bg-strong" },
];

function dotClass(decision?: Decision) {
  return DECISIONS.find((d) => d.value === decision)?.dot ?? "bg-muted-foreground/40";
}

/** Internal review tool: a floating button on every section opens an off-canvas to decide yes/no/maybe. */
export function SectionReview({ scanKey }: { scanKey: string }) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"review" | "note">("review");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReviews(JSON.parse(raw) as Record<string, Review>);
    } catch {
      /* ignore broken storage */
    }
    setVisible(localStorage.getItem(VISIBLE_KEY) !== "0");
    listSectionReviews()
      .then((rows) => {
        const fromDb: Record<string, Review> = {};
        for (const r of rows) {
          fromDb[r.section_id] = {
            decision: (r.decision as Decision | null) ?? undefined,
            comment: r.comment,
            note: r.note,
          };
        }
        setReviews((prev) => ({ ...prev, ...fromDb }));
      })
      .catch(() => {
        /* keep local copy if the database is unreachable */
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const found = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
      found.forEach((el) => el.classList.add("relative"));
      setTargets(
        found.map((el) => ({
          id: el.id,
          el,
          title: el.querySelector("h1, h2")?.textContent?.trim() || el.id,
        })),
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [scanKey]);

  const update = (id: string, patch: Partial<Review>) => {
    setReviews((prev) => {
      const next = { ...prev, [id]: { comment: "", ...prev[id], ...patch } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      const r = next[id];
      if (saveTimers[id]) window.clearTimeout(saveTimers[id]);
      saveTimers[id] = window.setTimeout(() => {
        saveSectionReview({
          data: { sectionId: id, decision: r.decision ?? null, comment: r.comment ?? "", note: r.note ?? "" },
        }).catch(() => toast.error("Speichern in der Datenbank fehlgeschlagen"));
      }, 600);
      return next;
    });
  };

  const toggleVisible = () => {
    const next = !visible;
    setVisible(next);
    localStorage.setItem(VISIBLE_KEY, next ? "1" : "0");
  };

  const copySummary = async () => {
    const lines = targets.map((t) => {
      const r = reviews[t.id];
      const label = DECISIONS.find((d) => d.value === r?.decision)?.label ?? "Offen";
      return `${t.title} (#${t.id}): ${label}${r?.comment ? `\n  Kommentar: ${r.comment}` : ""}${r?.note ? `\n  Notiz: ${r.note}` : ""}`;
    });
    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Zusammenfassung kopiert");
  };

  const current = targets.find((t) => t.id === openId);
  const review = openId ? reviews[openId] : undefined;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={toggleVisible}
        className="fixed bottom-16 left-4 z-50 gap-2 bg-card shadow-xl"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {visible ? "Review ausblenden" : "Review einblenden"}
      </Button>

      {visible &&
        targets.map((t) =>
          createPortal(
            <div key={t.id} className="absolute right-4 top-4 z-40 flex gap-2">
            <button
              type="button"
              onClick={() => { setMode("note"); setOpenId(t.id); }}
              aria-label={`Notiz zum Abschnitt: ${t.title}`}
              className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xl transition-colors hover:border-primary"
            >
              <StickyNote className={cn("size-4", reviews[t.id]?.note ? "text-primary" : "text-muted-foreground")} />
              Notiz
              {reviews[t.id]?.note && <span className="size-2 rounded-full bg-primary" />}
            </button>
            <button
              type="button"
              onClick={() => { setMode("review"); setOpenId(t.id); }}
              aria-label={`Abschnitt bewerten: ${t.title}`}
              className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xl transition-colors hover:border-primary"
            >
              <span className={cn("size-2.5 rounded-full", dotClass(reviews[t.id]?.decision))} />
              <ClipboardCheck className="size-4 text-primary" />
              Bewerten
              {reviews[t.id]?.comment && <MessageSquare className="size-3.5 text-muted-foreground" />}
            </button>
            </div>,
            t.el,
            t.id,
          ),
        )}

      <Sheet open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{current?.title ?? "Abschnitt"}</SheetTitle>
            <SheetDescription>{mode === "note" ? "Freie Notizen zu diesem Abschnitt." : "Soll dieser Abschnitt auf der Seite bleiben?"}</SheetDescription>
          </SheetHeader>

          {openId && (
            <div className="grid grid-cols-2 gap-2 px-4">
              <Button type="button" size="sm" variant={mode === "review" ? "default" : "outline"} onClick={() => setMode("review")}>Bewerten</Button>
              <Button type="button" size="sm" variant={mode === "note" ? "default" : "outline"} onClick={() => setMode("note")}>Notiz</Button>
            </div>
          )}

          {openId && mode === "note" && (
            <div className="flex flex-col gap-2 px-4">
              <Label htmlFor="review-note">Notizen</Label>
              <Textarea
                id="review-note"
                rows={10}
                placeholder="Ideen, Textentwürfe, To-dos …"
                value={review?.note ?? ""}
                onChange={(e) => update(openId, { note: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Wird automatisch gespeichert.</p>
            </div>
          )}

          {openId && mode === "review" && (
            <div className="flex flex-col gap-4 px-4">
              <div className="grid grid-cols-3 gap-2">
                {DECISIONS.map((d) => (
                  <Button
                    key={d.value}
                    type="button"
                    variant="outline"
                    onClick={() => update(openId, { decision: d.value })}
                    className={cn(review?.decision === d.value && d.active)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-comment">Kommentar</Label>
                <Textarea
                  id="review-comment"
                  rows={5}
                  placeholder="Was soll geändert werden?"
                  value={review?.comment ?? ""}
                  onChange={(e) => update(openId, { comment: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 border-t px-4 pb-4 pt-4">
            <p className="label-caps text-xs text-muted-foreground">Alle Abschnitte</p>
            <ul className="flex flex-col gap-1">
              {targets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted",
                      t.id === openId && "bg-muted",
                    )}
                  >
                    <span className={cn("size-2.5 shrink-0 rounded-full", dotClass(reviews[t.id]?.decision))} />
                    <span className="truncate">{t.title}</span>
                    {reviews[t.id]?.note && <StickyNote className="ml-auto size-3.5 shrink-0 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" onClick={copySummary} className="gap-2">
              <Copy className="size-4" /> Zusammenfassung kopieren
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
