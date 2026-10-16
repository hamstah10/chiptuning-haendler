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
- Design tokens come from the TuningFiles design system and live in `src/styles.css` (light default on :root, `.dark` override). Why: one source for brand colors and fonts.
- Two landing designs (light storytelling + dark original) share the same content and components; `landing-switch.tsx` picks one and remembers the choice in the browser. Why: visitors and the owner can compare both without separate routes.
