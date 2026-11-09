import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { googleReviews, type GoogleReview } from "@/lib/google-reviews";
import type { Content } from "@/lib/content";
import { Reveal } from "./motion";

function GoogleMark({ className }: { className?: string }) {
  // Official multi-colour Google "G" brand mark.
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.6 7l7.4 5.8c4.3-4 6.9-9.9 6.9-17.3z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(size, i <= Math.round(value) ? "fill-rating text-rating" : "fill-muted text-muted")}
        />
      ))}
    </div>
  );
}

export function GoogleReviews({ c }: { c: Content }) {
  const g = c.trust.google;
  const real = googleReviews.reviews.length > 0;
  const items: (GoogleReview & { sample?: boolean })[] = real
    ? googleReviews.reviews
    : c.trust.quotes.map((q) => ({ author: q.a, rating: 5, text: q.q, date: "", sample: true }));
  const rating = googleReviews.rating ?? 5;
  const locale = c.locale;

  return (
    <div>
      <Reveal>
        <div className="flex flex-col gap-4 rounded-md border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <GoogleMark className="size-10 shrink-0" />
            <div>
              <div className="text-sm font-medium text-strong">{g.source}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums text-strong">
                  {real ? rating.toFixed(1).replace(".", locale === "de" ? "," : ".") : "–"}
                </span>
                <Stars value={real ? rating : 0} />
                {real && googleReviews.total !== null && (
                  <span className="text-sm text-muted-foreground tabular-nums">
                    ({googleReviews.total} {g.reviewsLabel})
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {googleReviews.writeUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={googleReviews.writeUrl} target="_blank" rel="noopener noreferrer">{g.write}</a>
              </Button>
            )}
            {googleReviews.placeUrl && (
              <Button size="sm" asChild>
                <a href={googleReviews.placeUrl} target="_blank" rel="noopener noreferrer">
                  {g.cta} <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </Reveal>
      {!real && <p className="mt-3 text-sm text-muted-foreground">{g.pending}</p>}

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {items.map((r, i) => (
          <Reveal key={r.author + i} delay={0.1 * i} className="h-full">
            <figure className="flex h-full flex-col rounded-md border bg-card p-5">
              <div className="flex items-center gap-3">
                {r.avatarUrl ? (
                  <img src={r.avatarUrl} alt="" className="size-10 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                    {r.author.charAt(0).toUpperCase()}
                  </span>
                )}
                <figcaption className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-strong">{r.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.sample ? c.trust.sample : r.date ? formatDate(new Date(r.date), locale) : ""}
                  </div>
                </figcaption>
                <GoogleMark className="size-5 shrink-0" />
              </div>
              <div className="mt-3">
                <Stars value={r.rating} />
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-strong">{r.text}</blockquote>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
