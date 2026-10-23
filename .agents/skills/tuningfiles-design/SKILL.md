---
name: tuningfiles-design
description: Reuse the TuningFiles design system when creating or restyling landing pages, dealer pages, configurators or partner wizards. Trigger on “TuningFiles design”, “dieses Design wiederverwenden”, “helle Storytelling-Variante”, “dunkles Original” or requests for industrial automotive storytelling with scroll-linked Stage animations. Includes both light and dark compositions.
---

# TuningFiles design

## Scope and inputs

Apply the visual language of Tuningfiles-download.com, not its business data. Use the user's page request and the target project's actual copy, images, brand assets and functionality. No mandatory input beyond the page request; default to the light storytelling composition when the variant is unspecified.

Read `assets/theme-tokens.css` before implementing colors or typography. Merge its semantic roles into the target project's global design tokens rather than duplicating existing stylesheets. The token file is a Tailwind v4/shadcn reference; adapt the same roles to the target stack if necessary, without changing its framework.

## Visual identity

- Industrial automotive precision: neutral surfaces, technical headings, fine borders, generous chapter spacing and one tuning-red accent.
- Brand accent: #bd1e23; dark background: #161616; dark cards: #1c1c1c; dark body text: #ededed. Use the bundled oklch tokens in implementation; these hex values identify the brand, not additional component-level colors.
- Use Saira Condensed for headings (H1/H2 slanted), chapter numbers, labels and technical readouts; Saira for body copy and controls. Load fonts through document-head links, never remote CSS imports.
- Light mode uses near-white neutral backgrounds, white cards, dark headings and gray supporting text. Dark mode changes surface and text roles, not the brand accent.
- Keep controls crisp: approximately 4px corners for buttons and fields; at most 8px for cards. Do not use pill-shaped primary controls.
- Avoid gradients, decorative glow/orbs, purple accents, serif fonts and soft lifestyle styling. Some older source effects do not represent the intended reusable design.
- Use Lucide icons: Gauge for performance/brand fallback, Cpu for files, ShieldCheck for trust, Clock for turnaround and ArrowRight for forward actions. Prefer an actual supplied logo over the fallback.
- Use semantic color classes and existing design-system controls, preferably shadcn when available. Do not hardcode colors or visual inline styles in page components.
- Use sentence case for authored text. Technical labels may have an uppercase visual treatment. Keep letter spacing at zero; do not copy old negative heading tracking.

## Shared layout vocabulary

- Use full-width chapter bands separated by subtle borders, with an inner width around 72rem and approximately 20px side gutters.
- Give chapters roughly 80px vertical space on small screens and 112px on desktop, reducing this where screen height requires it.
- Chapter introductions use a small red numbered kicker, a bold compact heading and optional muted supporting text. Keep text widths constrained for scanning.
- Use a sticky header about 64px high, brand at left and language/theme controls plus the main conversion action at right. Keep anchor targets clear of it.
- Use cards only for repeated benefits, quotes, stage items or framed tools; do not frame entire page sections or nest cards.
- Show a thin red scroll-progress line and keep the main conversion action reachable. Ensure fixed controls do not cover content or each other on mobile.
- Establish the actual brand/product in the first viewport. Use relevant supplied media for an opening experience; a dyno graphic is a functional performance comparison, not a generic decorative hero substitute.

## Light storytelling composition

- Default to the light palette. The dark theme toggle changes palette independently of the chosen composition.
- Structure a dealer narrative as: opening → problem → solution → partner signup → process → earnings calculator → configurator → trust → FAQ → closing action. Adapt chapters to the requested page instead of adding unrequested tools.
- Show a restrained vertical chapter rail on sufficiently wide screens: numbers 01–08, a longer red line for the current chapter and optional chapter names when space permits. Hide it on narrow screens.
- Use before/after comparisons with neutral original values and red tuned values. Dyno lines can draw in progressively; label units clearly and mark illustrative performance values as examples.
- Process steps may move horizontally inside a vertically scrolling sticky section on desktop. Use a normal grid/list on mobile and for reduced-motion users.
- Place the lead form after the solution when conversion is the task, rather than forcing visitors through every chapter first.

## Dark original composition

- Default this composition to the dark palette, while retaining a light-mode toggle if requested.
- Structure the original dealer story as: opening → problem → solution → process → earnings calculator → configurator → signup → trust → FAQ → closing action.
- Use a compact desktop chapter navigation in the header rather than the light composition's side rail.
- Show benefits in bordered neutral cards with red icons. Connect four process steps with a fine red line and circular icon markers.
- Keep the opening strong and unframed, with staged text arrival and a row of technical KPIs. Avoid copying legacy glow or ornamental spinning-gauge effects.

## Motion and scroll-linked media

- Prefer `motion/react` when the project already uses React and Motion. Use short opacity/vertical reveals, modest staggered cards and technical counters; do not animate every element.
- Respect `prefers-reduced-motion`: use static reveals, ordinary process layouts and a meaningful static media state or explicitly controlled playback instead of mandatory scrubbing.
- For a supplied Tuning Drive animation, preserve its original file. Use a borderless 9:16 frame on a semantic dark media surface corresponding to #0e0e0e. Do not rebuild missing media; report an unavailable download.
- Sticky media should remain visible while scrolling through Stock → Stage 1 → Stage 2 → Stage 3. Fit its height beneath the header and inside the available viewport; show stage labels without overlapping the media on mobile.
- Drive playback from section progress in both directions, not from an independent autoplay loop. Read the supplied animation's actual timeline and verify the visible stage boundaries; do not assume equal card quarters match its authored timing.
- The original same-origin Tuning Drive HTML exposes `svg[data-om-exportable-video-with-duration-secs]`. Read duration from that attribute and dispatch `data-om-seek-to-time-frame` on the SVG with `detail: { time, sync: true }`. This is specific to that player, not a generic iframe API.
- Wait for the iframe and asynchronously unpacked player to be ready; clean up readiness polling and progress subscriptions on unmount. Clamp time just below the loop endpoint to avoid snapping back to Stock. Confirm seeking suppresses the player's independent clock.
- For other media use its documented seek API. Cross-origin frames require an explicitly supported messaging protocol; do not access their document.

## Content and reuse boundaries

- Default TuningFiles-specific copy to professional German using “du”; provide English when requested. Keep translations in shared locale data, not scattered section literals.
- Use real prices, turnaround times, power figures, testimonials and contact information from the target project. Do not carry across old example packages, revenue promises or customer quotes as facts.
- Treat design selection and light/dark theme as separate choices. Add a persistent two-composition selector only if the user asks to compare both; the skill containing both does not require exposing both on every site.
- Read browser preferences after hydration so server-rendered markup stays consistent.
- Keep this skill presentation-focused: adopting the design does not authorize schema, lead-storage or notification changes.

## Acceptance checks

- Verify wide and narrow layouts, both palettes and all requested controls in the browser. Check that chapter rails, fixed actions and header controls neither overlap nor create horizontal overflow.
- For scroll media, inspect Stock, both intermediate stages, Stage 3 and reverse scrolling; verify the frame remains still when scrolling stops.
- Verify reduced-motion behavior and that tool labels, units and longer translated text fit their allocated space.
- Keep each content page's own title, description and social metadata aligned with the actual page. Run relevant existing tests when application code changes.