import { Link } from "@tanstack/react-router";
import { legal, legalPaths } from "@/lib/legal";
import type { Locale } from "@/lib/format";

export function LegalLinks({ locale }: { locale: Locale }) {
  const t = legal[locale];
  const p = legalPaths[locale];
  return (
    <nav className="flex gap-4 text-sm">
      <Link to={p.imprint} className="text-muted-foreground hover:text-strong">
        {t.imprintLink}
      </Link>
      <Link to={p.privacy} className="text-muted-foreground hover:text-strong">
        {t.privacyLink}
      </Link>
    </nav>
  );
}
