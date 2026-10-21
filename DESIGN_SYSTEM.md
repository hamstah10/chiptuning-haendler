# TuningFiles Designsystem

Industrielle Präzision: neutrale Flächen, feine Linien, ein einziges Tuning-Rot als Akzent.
Live-Showcase aller Tokens und Komponenten: **`/design-system`** (hell/dunkel umschaltbar).

## Tokens

Alle Werte liegen als oklch-Tokens in `src/styles.css` (hell auf `:root`, dunkel über `.dark`).
Komponenten verwenden ausschließlich die semantischen Klassen – niemals Hex-Werte oder
`text-white`/`bg-black` im Markup.

| Gruppe | Tokens |
| --- | --- |
| Flächen | `background`, `sunken`, `raised`, `card`, `popover` |
| Text | `foreground`, `strong` (Überschriften), `muted-foreground`, `faint` |
| Akzent | `primary` (Tuning-Rot), `primary-hover`, `primary-soft`, `primary-foreground` |
| Nebenrollen | `secondary`, `muted`, `accent` (jeweils mit `-foreground`) |
| Status | `destructive`, `success` |
| Linien/Fokus | `border`, `border-strong`, `input`, `ring` |

**Dark Mode:** Die Klasse `.dark` auf einem umschließenden Element wechselt das Schema. Das
Tuning-Rot bleibt in beiden Schemata identisch; nur Flächen- und Textrollen ändern sich.

## Typografie

- **Chakra Petch** (`font-display`, `font-mono`): Überschriften, Kapitelnummern, technische
  Anzeigen (PS/Nm). H1–H3 sind im Basis-Stylesheet fett und in Großbuchstaben.
- **Mulish** (`font-sans`): Fließtext und Bedienelemente.
- Utilities: `kicker` (kleiner roter Kapitel-Einstieg), `label-caps` (Buttons/Markierungen).

## Radien und Abstände

Basis-Radius 8 px: `rounded-sm` 4 px (Chips), `rounded-md` 6 px (Buttons, Felder),
`rounded-lg` 8 px (Karten), `rounded-xl` 12 px (sparsam). Keine Pill-Formen.
Abstände folgen der Tailwind-Skala (4-px-Schritte); Seitenkapitel bekommen großzügigen
vertikalen Raum.

## Kernkomponenten (shadcn, `src/components/ui`)

| Komponente | Varianten | Regel |
| --- | --- | --- |
| Button | `default`, `secondary`, `outline`, `ghost`, `link`, `destructive`; Größen `sm`/`default`/`lg`/`icon` | Ein primärer Button pro Abschnitt; `destructive` nur für zerstörerische Aktionen |
| Badge | `default`, `secondary`, `outline`, `destructive` | Status und Kategorien, kurze Begriffe, keine Buttons |
| Card | `CardHeader`/`Title`/`Description`/`Content`/`Footer` | Nur für wiederkehrende Inhalte (Pakete, Vorteile); keine verschachtelten Karten, keine ganzen Abschnitte einrahmen |
| Input / Textarea / Label | Standard, `disabled`, Fehlerzustand | Immer sichtbares Label; Fehlermeldung direkt darunter in `destructive` |
| Alert | `default`, `destructive` | Bestätigungen und Probleme am Ort des Geschehens; kurze Hinweise als Toast (sonner) |
| Tabs | `TabsList`/`TabsTrigger`/`TabsContent` | Gleichwertige Inhalte einer Ebene, keine Schrittfolgen |

Weitere verfügbare Bausteine: Accordion, Dialog, Sheet, Select, Checkbox, RadioGroup, Switch,
Slider, Progress, Separator, Skeleton, Table, Tooltip, sonner (Toasts).

## Sprache und Ton

- Deutsch mit „du", freundlich-professionell; Satzschreibung in Überschriften und Buttons.
- Deutsche Zahlen- und Datumsformate: `1.234,56`, `DD.MM.YYYY`.
- Keine Platzhaltertexte; jede Zeile ist eine echte, prüfbare Aussage.
- Copy liegt zentral in `src/lib/content.ts` (DE/EN parallel), Komponenten rendern nur.
