# Landingpage "Chiptuning-Händler werden" – Tuningfiles-download.com

## Ziel
Eine Landingpage, die wie eine Geschichte aufgebaut ist: Wer runterscrollt, geht Kapitel für Kapitel durch und landet am Ende bei der Händler-Anfrage. Mit Animationen, gebaut für Anfragen (Leads) und Suchmaschinen, auf Deutsch und Englisch.

## Design (aus deinem Design-System)
- Fast schwarzer Hintergrund (#161616), Karten in #1c1c1c, Text #ededed, nur eine Akzentfarbe: Tuning-Rot #bd1e23
- Schriften: Chakra Petch für Überschriften (fett, Großbuchstaben), Mulish für Fließtext
- Klare Formen: 4px bei Buttons und Feldern, 8px bei Karten, feine Linien, keine Farbverläufe
- Icons von Lucide, Ton: professionell, B2B, konkrete Zahlen (seit 2005, 30–60 Min., Stage 1–3)
- Hell/Dunkel-Umschalter wie im Partner-Kit
- Gebaut mit shadcn-Bausteinen, umgestellt auf die Farben, Schriften und Formen von oben

## Story-Aufbau (beim Scrollen)
1. **Einstieg**: "Chiptuning anbieten. Wir schreiben die Datei.", Kennzahlen zählen hoch, Buttons "Jetzt Partner werden" und "Verdienst berechnen"
2. **Das Problem**: Werkstätten verschenken Umsatz, eine eigene Kalibrierung ist teuer und dauert lange
3. **Die Lösung**: Fileservice mit geprüften Kennfeldern in 30–60 Minuten, ohne Grundgebühr und ohne Vertragsbindung
4. **So funktioniert es**: 4 animierte Schritte
5. **Verdienstrechner**: interaktive Beispielrechnung
6. **Konfigurator**: der Konfigurator aus deinem Kit (Marke, Modell, Motor, Stage, Leistungskurve)
7. **Partner-Wizard**: die 4-Schritt-Anmeldung aus deinem Kit; jede abgeschlossene Anmeldung wird als Lead gespeichert
8. **Vertrauen**: Erfolgsbeispiele, Vertrauensleiste
9. **Häufige Fragen**: zum Aufklappen
10. **Abschluss**: letzter Aufruf zur Anmeldung

Ein "Jetzt Partner werden"-Button bleibt immer sichtbar, oben zeigt ein Balken, wie weit man gescrollt hat.

## Leads
- Jede Anfrage aus dem Wizard und dem Konfigurator wird gespeichert
- Du bekommst zu jeder Anfrage eine E-Mail
- Der Interessent sieht danach eine Bestätigung auf der Seite

## SEO
- Deutsche Seite unter / und englische unter /en, jeweils mit eigenem Titel und eigener Beschreibung, gegenseitig als Sprachversion verknüpft
- Strukturierte Daten (Organisation, Leistung), saubere Überschriften, schnelle Ladezeit

## Was noch fehlt
- E-Mail-Adresse, an die die Leads gehen sollen
- Echte Fotos (im Kit sind es Platzhalter), Logo-Datei, echte Kundenstimmen. Bis dahin verwende ich die Texte und Zahlen aus deinem Kit, markiere sie als Platzhalter und frage dich danach nach den echten Inhalten.

## Technische Details
- Fester Projekt-Stack (React/TanStack Start). Die Arbeitsbereich-Vorgaben zu Symfony, Twig und Bootstrap lassen sich hier nicht umsetzen. Alle anderen Regeln gelten weiter: Datum DD.MM.YYYY, deutsche Zahlenformate, Groß-/Kleinschreibung wie im Satz, kein console.log, kein any.
- Die Tokens aus `tokens/*.css` kommen als oklch-Variablen in `src/styles.css`, die Schriften werden über `<link>` im Root geladen
- Aus `KonfWidget.jsx`, der Wizard-Vorlage bzw. `PartnerContent.jsx` und `Motion.jsx` (Reveal, AnimNumber, ScrollProgress) werden typisierte React-Komponenten auf Basis von shadcn
- Routen: `index.tsx` (DE) und `en.tsx` (EN), gemeinsame Sektionen mit Übersetzungsdateien, je Route ein eigenes head() mit hreflang
- Lovable Cloud: Tabelle `dealer_leads`, Speichern per Server-Funktion mit zod-Prüfung, danach Benachrichtigung per E-Mail
- Animationen respektieren die Systemeinstellung "Bewegung reduzieren"
