<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Landing page copy lives in `src/lib/content.ts` (one object per locale, `en` typed as `typeof de`); sections only render it. Why: DE/EN stay in sync and SEO pages share one layout.
- Leads are written only via the `submitLead` server function (zod-validated, admin client); `dealer_leads` has no public policies. Why: visitors must never read or alter leads.
- Call server functions directly (`fn({ data })`) from event handlers, never via `useServerFn`. Why: `useServerFn`-wrapped calls silently never fire in this setup, while direct calls work (proven by `submitLead`).
- AI Gateway calls in server functions use `createResponsesCall` from `src/lib/ai/responses.server.ts` without the incoming `Request` (no `getRequest()`, no `abortSignal`). Why: the RPC request's abort signal kills the outgoing gateway fetch and the call hangs forever.
- Design tokens come from the TuningFiles design system and live in `src/styles.css` (light default on :root, `.dark` override). Why: one source for brand colors and fonts.
- Three landing designs (light storytelling, dark original, and mixed chapters) share content and tools; `landing-switch.tsx` remembers the choice, and mixed reuses the light layout with a dedicated animated photographic opening and scoped `.light`/`.dark` chapter tokens. Why: alternatives stay synchronized without duplicating tools or business logic.
- Layers the browser renders outside the page tree (toasts, dialogs, menus, tooltips) must read the theme from `.dark` on `<html>` and get their colors from the token mapping in `src/styles.css`. Why: they live at document level, so a theme class on a wrapper element never reaches them.
- Legal page copy and provider data (imprint, privacy) live in `src/lib/legal.ts`, separate from landing copy. Why: legal texts change on their own schedule and must use the official business data only.
- Preserve the original uploaded Tuning Drive HTML; serve a separate layout copy with the local embed stylesheet while keeping settings and the external embed unchanged. Do not access the external frame DOM or invent seek messages. Why: layout must load before hydration, and the embed has no scroll playback API.
- Chapter navigation resolves the section at the viewport focus line from all observed bounds and uses a shared animated indicator. Why: observer callback order must not cause chapter jumps; reduced motion skips the animation.
- Vehicle selection shares a cascading DCT selector; a validated read-only server function supplies only vehicle lists and typed engine details using both server-side credentials. Why: no credential or invented tuning value reaches browser code.
- Vehicle selection preserves DCT media fields, resolves them only against the HTTPS portal origin, and uses a shared icon renderer with image fallback. Why: API-provided vehicle imagery stays consistent without unsafe URLs or broken-image placeholders.
- Shared motor selects group and naturally sort engines using the API fuel field, with localized labels and an explicit missing-fuel group. Why: both vehicle tools remain identical without guessing technical specifications.
- Both vehicle tools use a shared read-only renderer that deduplicates active tuning options by normalized name and lists each engine/ECU assignment with its original prices. Why: each option must appear once without losing ECU-specific availability or price differences.
- Public page headers share a language selector with local flag assets and explicit equivalent-page destinations. Why: changing language must retain the page topic and use existing translated content rather than runtime machine translation.
