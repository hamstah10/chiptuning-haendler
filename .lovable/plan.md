# Wizard „Chiptuning Händler werden" – neues Aussehen und passende Auswahlelemente

## Ziel
Der Wizard im Abschnitt „Chiptuning Händler werden" soll genauso aussehen wie die Werkzeuge darunter (Fahrzeug-Check, Verdienstrechner, Dyno-Vergleich). Außerdem bekommt jede Fragenart ein eigenes, passendes Auswahlelement statt überall gleicher Kacheln.

## 1. Einheitliches Aussehen wie die Abschnitte darunter
- Gleicher Rahmen wie Konfigurator/Fahrzeug-Check: flache Fläche, feine Linie, kein Schatten, gleiche Ecken und Abstände.
- Zweispaltig auf großen Bildschirmen: links eine senkrechte Schrittliste (01–05 mit Namen, aktiver Schritt rot, erledigte mit Haken), rechts die Fragen. Auf dem Handy oben eine schmale Fortschrittsleiste.
- Gleiche Feldhöhe, Rahmen und Schrift wie in den anderen Werkzeugen; Buttons „Zurück" / „Weiter" in derselben Form wie dort.
- Kleine Zusammenfassung „Deine Auswahl" (bisherige Antworten als Chips), mit Klick zurück zum jeweiligen Schritt.
- Sanfte Übergänge zwischen den Schritten (kurzes Ein-/Ausblenden, ohne Springen; bei reduzierter Bewegung aus).

## 2. Passende Auswahlelemente je Frage
| Frage aus dem Portal | Neues Element |
|---|---|
| Wenige Antworten (bis 4), eine Wahl – z. B. Erfahrung, Betriebsart | Große Auswahlkarten mit Symbol und Kurztext |
| Fahrzeugtypen (7, mehrere) | Bildkarten 4 pro Reihe (bleibt), mit Zähler „2 gewählt" |
| Tool-Hersteller (5) | Logo-Kacheln mit Herstellerlogo, plus „Noch kein Tool" als eigene Option |
| Viele Antworten (12) | Kompakte Chips zum An-/Abwählen, mit „Alle wählen / zurücksetzen" |
| Skalen-Fragen (Reihenfolge wie wenig → viel) | Segment-Leiste (nebeneinander liegende Schalter) |
| Kontakt: Textfelder / E-Mail / Nachricht | Felder mit Beschriftung oben, Fehlermeldung direkt darunter |
| Kontakt: Auswahl-Liste | Ausklappliste im Stil des Konfigurators |
| Kontakt: Radio | Segment-Leiste |
| Kontakt: Mehrfach-Checkbox | Chips |
| Einwilligungen (einzelne Checkbox) | Schalter mit Text |
| Termin | Monatskalender links, freie Uhrzeiten rechts (wie dein Screenshot) |

Die Zuordnung erfolgt automatisch anhand dessen, was das Portal pro Frage liefert (Art, Anzahl Antworten, Mehrfachwahl). Inhalte, Texte und Logik bleiben unverändert aus dem Portal.

## 3. Ergebnis-Schritt
Empfehlung im Stil der Ergebniskarten darunter: Paket oben hervorgehoben, Tools als Karten mit Logo und Preis.

## Nicht geändert
Fragen, Reihenfolge, Absenden über deinen Server, WhatsApp-/E-Mail-Benachrichtigung, JSON-Debug-Ansicht.

## Technische Details
- Neue Bausteine in `src/components/landing/wizard-fields/` (ChoiceCards, LogoTiles, ChipGroup, SegmentedControl, SwitchField, MonthCalendar); `QuestionBlock` wählt per `pickVariant(question)` (reine Funktion, mit Test für die Zuordnungsregeln).
- `partner-wizard-dct.tsx`: Layout mit Schrittliste + Zusammenfassung, Übergänge via motion `AnimatePresence`.
- `wizard-contact.tsx`: Felder auf shadcn `Select`, `Switch`, Segment-Leiste umgestellt; `AppointmentPicker` wird Monatsansicht.
- Nur Tokens aus `src/styles.css`, gleiche Klassen wie Konfigurator (`h-10 border-border-strong bg-sunken shadow-none`).
