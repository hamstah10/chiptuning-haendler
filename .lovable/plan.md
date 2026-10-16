# Landingpage "Chiptuning-Händler werden" – Tuningfiles-download.com

## Ziel
Eine Landingpage, die wie eine Geschichte erzählt ist: Interessenten scrollen durch Kapitel und werden zu Händler-Anfragen geführt. Mit Animationen, für Leads und Suchmaschinen optimiert, auf Deutsch und Englisch.

## Story-Aufbau (beim Scrollen)
1. **Einstieg** – große Headline "Werde Chiptuning-Händler", animiertes Drehzahl-/Leistungsmotiv, Button "Jetzt Händler werden"
2. **Das Problem** – Werkstätten verschenken Umsatz, eigene Kalibrierung ist teuer und langsam
3. **Die Lösung** – Tuningfiles-download.com als Partner: fertige Files, schneller Service, Support
4. **So funktioniert es** – 3–4 animierte Schritte (Anmelden, Datei hochladen, Datei erhalten, Kunde glücklich)
5. **Zahlen & Vorteile** – hochzählende Kennzahlen, Vorteile als Karten
6. **Konfigurator** – deine vorhandene Konfigurator-Komponente, im Design der Seite
7. **Wizard "Chiptuning anbieten"** – deine vorhandene Wizard-Komponente, im Design der Seite; jede abgeschlossene Anfrage wird als Lead gespeichert
8. **Stimmen & Vertrauen** – Kundenstimmen, Logos, Sicherheitsmerkmale
9. **Häufige Fragen** – aufklappbar
10. **Abschluss** – letzter Aufruf zur Anfrage

Ein fixierter "Händler werden"-Button bleibt beim Scrollen sichtbar.

## Leads
- Jede Anfrage wird gespeichert (Lovable Cloud)
- Du bekommst zu jeder Anfrage eine E-Mail
- Bestätigung für den Interessenten auf der Seite

## SEO
- Eigene Seiten für Deutsch (/) und Englisch (/en) mit passenden Titeln, Beschreibungen und Sprachverknüpfung
- Strukturierte Daten (Organisation, Fragen/Antworten-Bereich als Inhalt)
- Schnelle Ladezeit, saubere Überschriften-Struktur

## Was ich von dir brauche
- **Wizard- und Konfigurator-Komponente**: bitte den Code hochladen oder einfügen
- **Design**: Grundlage ist shadcn (Bausteine wie Buttons, Karten, Formulare, Akkordeon) mit eigenem Farbthema in Dunkel/Chiptuning-Optik
- Echte Texte/Zahlen (Anzahl Händler, Fahrzeuge, Bearbeitungszeit), Kundenstimmen, Logo, E-Mail-Adresse für Leads. Bis dahin setze ich realistische Beispielinhalte ein und markiere sie.

## Technische Details
- Umsetzung mit dem fest vorgegebenen Projekt-Stack (React/TanStack Start). Die Arbeitsbereich-Vorgaben zu Symfony/Twig/Bootstrap sind hier technisch nicht umsetzbar; übrige Regeln (Formate DD.MM.YYYY, deutsche Zahlen, Satz-Schreibweise, kein console.log, kein any) werden eingehalten.
- Routen: `index.tsx` (DE), `en.tsx` (EN), gemeinsame Sektions-Komponenten mit Übersetzungsdateien
- Animationen per Scroll-Einblendung (framer-motion), respektiert "reduzierte Bewegung"
- Lovable Cloud: Tabelle `dealer_leads` mit Insert-Policy für Besucher, Server-Funktion zum Speichern + E-Mail-Versand (E-Mail-Domain wird eingerichtet)
- shadcn/ui-Komponenten, Theme-Tokens in `src/styles.css`; Wizard und Konfigurator werden auf diese Tokens umgestellt
