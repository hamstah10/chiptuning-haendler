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
- Two landing designs (light storytelling + dark original) share the same content and components; `landing-switch.tsx` picks one and remembers the choice in the browser. Why: visitors and the owner can compare both without separate routes.
- Layers the browser renders outside the page tree (toasts, dialogs, menus, tooltips) must read the theme from `.dark` on `<html>` and get their colors from the token mapping in `src/styles.css`. Why: they live at document level, so a theme class on a wrapper element never reaches them.
- Legal page copy and provider data (imprint, privacy) live in `src/lib/legal.ts`, separate from landing copy. Why: legal texts change on their own schedule and must use the official business data only.
