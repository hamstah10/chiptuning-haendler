import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Gauge,
  Info,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Designsystem – Tuningfiles-download.com" },
      {
        name: "description",
        content:
          "Das TuningFiles-Designsystem: Farb-Tokens, Typografie, Radien und Kernkomponenten mit Nutzungsregeln – live in Hell und Dunkel.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Designsystem – Tuningfiles-download.com" },
      {
        property: "og:description",
        content: "Tokens, Komponenten und Nutzungsregeln des TuningFiles-Designsystems.",
      },
    ],
  }),
  component: DesignSystemPage,
});

const colorTokens: { name: string; swatch: string; text?: string; note: string }[] = [
  { name: "background", swatch: "bg-background border", note: "Seitengrund (Werkstatt-Papier)" },
  { name: "foreground", swatch: "bg-foreground", note: "Fließtext" },
  { name: "strong", swatch: "bg-strong", note: "Überschriften" },
  { name: "faint", swatch: "bg-faint", note: "Schwache Hinweistexte" },
  { name: "sunken", swatch: "bg-sunken border", note: "Eingetiefte Flächen" },
  { name: "raised", swatch: "bg-raised border", note: "Leicht gehobene Flächen" },
  { name: "card", swatch: "bg-card border", note: "Karten und Panels" },
  { name: "primary", swatch: "bg-primary", note: "Tuning-Rot, einziger Akzent" },
  { name: "primary-hover", swatch: "bg-primary-hover", note: "Hover-Zustand von primary" },
  { name: "primary-soft", swatch: "bg-primary-soft", note: "Zarte Rot-Tönung für Marker" },
  { name: "secondary", swatch: "bg-secondary border", note: "Nebenaktionen" },
  { name: "muted", swatch: "bg-muted border", note: "Ruhige Flächen" },
  { name: "muted-foreground", swatch: "bg-muted-foreground", note: "Begleittext" },
  { name: "accent", swatch: "bg-accent border", note: "Hover-Flächen" },
  { name: "destructive", swatch: "bg-destructive", note: "Fehler und Warnungen" },
  { name: "success", swatch: "bg-success", note: "Erfolgsmeldungen" },
  { name: "border", swatch: "bg-border", note: "Feine Linien" },
  { name: "border-strong", swatch: "bg-border-strong", note: "Betonte Linien" },
  { name: "input", swatch: "bg-input", note: "Feldrahmen" },
  { name: "ring", swatch: "bg-ring", note: "Fokus-Ring" },
];

const radii = [
  { name: "rounded-sm", value: "4 px", use: "Chips, kleine Buttons" },
  { name: "rounded-md", value: "6 px", use: "Buttons, Eingabefelder" },
  { name: "rounded-lg", value: "8 px", use: "Karten, Panels" },
  { name: "rounded-xl", value: "12 px", use: "Große Container, sparsam" },
];

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t py-14 first:border-t-0">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-2 text-2xl md:text-3xl">{title}</h2>
      <div className="mt-8 space-y-10">{children}</div>
    </section>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function DesignSystemPage() {
  const [dark, setDark] = useState(false);

  // Toasts, Dialoge, Menüs und Tooltips werden vom Browser ans Ende des
  // Dokuments gehängt – deshalb muss das Schema auf dem html-Element stehen,
  // damit sie dasselbe Farbbild zeigen wie der Rest der Seite.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className={cn(dark && "dark")}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-strong">
              <Gauge className="size-5 text-primary" aria-hidden />
              TuningFiles Designsystem
            </Link>
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-muted-foreground" aria-hidden />
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                aria-label="Dunkles Farbschema umschalten"
              />
              <Moon className="size-4 text-muted-foreground" aria-hidden />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 pb-24">
          <div className="py-14">
            <p className="kicker">Grundlage für alle Seiten</p>
            <h1 className="mt-3 text-4xl md:text-5xl">Das TuningFiles-Designsystem</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Industrielle Präzision statt Deko: neutrale Flächen, feine Linien und ein einziges
              Tuning-Rot als Akzent. Alle Werte kommen aus den Tokens in{" "}
              <code className="font-mono text-sm text-strong">src/styles.css</code> – Komponenten
              nutzen ausschließlich diese semantischen Klassen, niemals feste Farbwerte. Oben
              rechts schaltest du zwischen hellem und dunklem Schema um.
            </p>
          </div>

          <Section id="farben" kicker="01 – Tokens" title="Farben">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {colorTokens.map((t) => (
                <div key={t.name} className="rounded-lg border bg-card p-3">
                  <div className={cn("h-12 w-full rounded-md", t.swatch)} />
                  <p className="mt-2 font-mono text-xs font-semibold text-strong">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.note}</p>
                </div>
              ))}
            </div>
            <Rule>
              Das dunkle Schema ändert nur Flächen- und Textrollen über die Klasse{" "}
              <code className="font-mono">.dark</code> – das Tuning-Rot bleibt in beiden Schemata
              identisch. Neue Farben werden als Token in der Stylesheet-Datei angelegt, nie als
              Hex-Wert in einer Komponente.
            </Rule>
          </Section>

          <Section id="typografie" kicker="02 – Tokens" title="Typografie">
            <div className="space-y-6 rounded-lg border bg-card p-6">
              <div>
                <p className="kicker">Kicker – Saira, Kapitälchen</p>
                <h1 className="mt-2 text-4xl">Überschrift 1 – Saira kursiv</h1>
                <h2 className="mt-3 text-2xl">Überschrift 2 – Mehr Leistung für deine Werkstatt</h2>
                <h3 className="mt-3 text-xl">Überschrift 3 – Stage 1 bis Stage 3</h3>
              </div>
              <Separator />
              <div className="space-y-3">
                <p>
                  Fließtext – Saira Condensed. Mit Tuningfiles-download.com bietest du deinen Kunden
                  professionelles Chiptuning an, ohne selbst Software entwickeln zu müssen. Du
                  lädst die Originaldatei hoch, wir liefern die optimierte Datei zurück.
                </p>
                <p className="text-muted-foreground">
                  Begleittext in muted-foreground für weniger wichtige Informationen wie
                  Lieferzeiten oder rechtliche Hinweise.
                </p>
                <p className="font-mono text-sm text-strong">
                  Technische Anzeige – 190 PS · 320 Nm · Stage 1
                </p>
                <p className="label-caps text-sm">Label-Caps für Buttons und Markierungen</p>
              </div>
            </div>
            <Rule>
              Saira kursiv nur für große Überschriften; Saira Condensed für alles Lesbare,
              Kapitelnummern und technische Anzeigen. Überschriften stehen in Großbuchstaben mit
              fetter Schrift – das
              kommt aus dem Basis-Stylesheet, nicht aus einzelnen Klassen.
            </Rule>
          </Section>

          <Section id="radien" kicker="03 – Tokens" title="Radien und Abstände">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {radii.map((r) => (
                <div key={r.name} className="rounded-lg border bg-card p-4 text-center">
                  <div className={cn("mx-auto h-14 w-14 border-2 border-primary bg-primary-soft", r.name)} />
                  <p className="mt-3 font-mono text-xs font-semibold text-strong">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.value} – {r.use}
                  </p>
                </div>
              ))}
            </div>
            <Rule>
              Ecken bleiben kantig: 4 px für kleine Elemente, 8 px für Karten. Keine runden
              Pill-Buttons. Abstände folgen der Tailwind-Skala in 4-px-Schritten; Kapitel auf
              Seiten bekommen großzügigen vertikalen Raum.
            </Rule>
          </Section>

          <Section id="button" kicker="04 – Komponenten" title="Button">
            <div className="space-y-6 rounded-lg border bg-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Jetzt Partner werden</Button>
                <Button variant="secondary">Preise ansehen</Button>
                <Button variant="outline">Datei hochladen</Button>
                <Button variant="ghost">Mehr erfahren</Button>
                <Button variant="link">AGB lesen</Button>
                <Button variant="destructive">Anfrage löschen</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Klein</Button>
                <Button size="default">Standard</Button>
                <Button size="lg">
                  Groß <ArrowRight aria-hidden />
                </Button>
                <Button size="icon" aria-label="Leistung anzeigen">
                  <Gauge aria-hidden />
                </Button>
                <Button disabled>Deaktiviert</Button>
              </div>
            </div>
            <Rule>
              Genau ein primärer Button pro Abschnitt – er trägt die Hauptaktion (z. B. „Jetzt
              Partner werden"). Sekundäre und Outline-Buttons für Alternativen, Ghost und Link für
              unauffällige Aktionen. Destructive nur für wirklich zerstörerische Schritte.
            </Rule>
          </Section>

          <Section id="badge" kicker="05 – Komponenten" title="Badge">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-6">
              <Badge>Stage 1</Badge>
              <Badge variant="secondary">Bis 24 h Lieferzeit</Badge>
              <Badge variant="outline">Neu</Badge>
              <Badge variant="destructive">Datei fehlerhaft</Badge>
            </div>
            <Rule>
              Badges kennzeichnen Status und Kategorien, sie sind keine Buttons. Kurze Begriffe,
              keine ganzen Sätze.
            </Rule>
          </Section>

          <Section id="card" kicker="06 – Komponenten" title="Card">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <Cpu className="size-6 text-primary" aria-hidden />
                  <CardTitle>Pro-Paket</CardTitle>
                  <CardDescription>Für Werkstätten mit regelmäßigem Tuning-Aufkommen</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    149 € im Monat, 32 € pro Datei. Inklusive prioritärer Bearbeitung und
                    Support am selben Tag.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Paket wählen</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <ShieldCheck className="size-6 text-primary" aria-hidden />
                  <CardTitle>Geprüfte Qualität</CardTitle>
                  <CardDescription>Jede Datei wird vor dem Versand kontrolliert</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Unsere Ingenieure prüfen jede optimierte Datei auf Prüfstand-erprobten
                    Kennfeldern.
                  </p>
                </CardContent>
              </Card>
            </div>
            <Rule>
              Karten gruppieren wiederkehrende Inhalte wie Pakete, Vorteile oder Stufen. Ganze
              Seitenabschnitte werden nicht in Karten gefasst, und Karten werden nicht
              verschachtelt.
            </Rule>
          </Section>

          <Section id="input" kicker="07 – Komponenten" title="Eingabefelder">
            <div className="grid max-w-md gap-5 rounded-lg border bg-card p-6">
              <div className="space-y-2">
                <Label htmlFor="ds-company">Werkstattname</Label>
                <Input id="ds-company" placeholder="z. B. Autohaus Sancken" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-mail">E-Mail</Label>
                <Input id="ds-mail" type="email" placeholder="name@werkstatt.de" disabled />
                <p className="text-xs text-muted-foreground">Deaktiviertes Feld</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-msg">Nachricht</Label>
                <Textarea id="ds-msg" placeholder="Womit können wir dir helfen?" rows={3} />
              </div>
            </div>
            <Rule>
              Jedes Feld bekommt ein sichtbares Label, Platzhalter zeigen nur Beispielformate.
              Fehlermeldungen stehen direkt unter dem Feld und nutzen destructive.
            </Rule>
          </Section>

          <Section id="alert" kicker="08 – Komponenten" title="Alert">
            <div className="max-w-2xl space-y-4">
              <Alert>
                <CheckCircle2 aria-hidden />
                <AlertTitle>Datei erfolgreich hochgeladen</AlertTitle>
                <AlertDescription>
                  Wir melden uns innerhalb von 24 Stunden mit deiner optimierten Datei.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTriangle aria-hidden />
                <AlertTitle>Upload fehlgeschlagen</AlertTitle>
                <AlertDescription>
                  Die Datei ist größer als 20 MB. Bitte komprimiere sie und versuche es erneut.
                </AlertDescription>
              </Alert>
            </div>
            <Rule>
              Alerts bestätigen Aktionen oder erklären Probleme direkt am Ort des Geschehens. Für
              kurze Bestätigungen ohne Handlungsbedarf reicht ein Toast (sonner).
            </Rule>
          </Section>

          <Section id="tabs" kicker="09 – Komponenten" title="Tabs">
            <Tabs defaultValue="stage1" className="max-w-2xl">
              <TabsList>
                <TabsTrigger value="stage1">Stage 1</TabsTrigger>
                <TabsTrigger value="stage2">Stage 2</TabsTrigger>
                <TabsTrigger value="stage3">Stage 3</TabsTrigger>
              </TabsList>
              <TabsContent value="stage1" className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                Reine Softwareoptimierung am Serienfahrzeug – ohne Hardware-Eingriff, mit
                spürbar mehr Drehmoment.
              </TabsContent>
              <TabsContent value="stage2" className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                Software plus angepasste Peripherie wie Downpipe oder Ladeluftkühler für
                deutlich mehr Leistung.
              </TabsContent>
              <TabsContent value="stage3" className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                Maximales Setup mit größerem Turbolader – abgestimmt auf Prüfstand und
                Einsatzzweck.
              </TabsContent>
            </Tabs>
            <Rule>
              Tabs teilen gleichwertige Inhalte auf einer Ebene – nicht für Schritt-für-Schritt
              Abläufe. Wenige, kurze Beschriftungen.
            </Rule>
          </Section>

          <Section id="select" kicker="10 – Komponenten" title="Select">
            <div className="grid max-w-md gap-5 rounded-lg border bg-card p-6">
              <div className="space-y-2">
                <Label htmlFor="ds-stage">Gewünschte Stufe</Label>
                <Select>
                  <SelectTrigger id="ds-stage">
                    <SelectValue placeholder="Stufe wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stage1">Stage 1 – Softwareoptimierung</SelectItem>
                    <SelectItem value="stage2">Stage 2 – Software plus Peripherie</SelectItem>
                    <SelectItem value="stage3">Stage 3 – Maximales Setup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-fuel">Kraftstoff</Label>
                <Select disabled>
                  <SelectTrigger id="ds-fuel">
                    <SelectValue placeholder="Diesel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="benzin">Benzin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Deaktiviertes Feld</p>
              </div>
            </div>
            <Rule>
              Select für eine Auswahl aus einer festen Liste ab etwa vier Optionen – bei zwei bis
              drei Optionen sind Radio-Buttons besser sichtbar. Wie jedes Feld mit Label, der
              Platzhalter benennt die Auswahl, nicht das Format.
            </Rule>
          </Section>

          <Section id="checkbox" kicker="11 – Komponenten" title="Checkbox">
            <div className="max-w-md space-y-4 rounded-lg border bg-card p-6">
              <div className="flex items-start gap-3">
                <Checkbox id="ds-agb" defaultChecked />
                <div className="space-y-1">
                  <Label htmlFor="ds-agb">Ich habe die AGB gelesen und akzeptiere sie.</Label>
                  <p className="text-xs text-muted-foreground">Pflichtfeld vor dem Absenden</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="ds-news" />
                <Label htmlFor="ds-news">
                  Ich möchte über neue Fahrzeugmodelle und Preisänderungen informiert werden.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="ds-disabled" disabled />
                <Label htmlFor="ds-disabled" className="text-muted-foreground">
                  Deaktivierte Option (noch nicht verfügbar)
                </Label>
              </div>
            </div>
            <Rule>
              Checkboxen für unabhängige Ja/Nein-Entscheidungen und Einwilligungen – niemals
              vorausgewählt, wenn es um eine rechtliche Zustimmung geht. Das Label steht rechts
              daneben und ist selbst klickbar.
            </Rule>
          </Section>

          <Section id="dialog" kicker="12 – Komponenten" title="Dialog">
            <div className="rounded-lg border bg-card p-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Beispiel-Dialog öffnen</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Datei wirklich löschen?</DialogTitle>
                    <DialogDescription>
                      Die hochgeladene Originaldatei wird entfernt und kann nicht
                      wiederhergestellt werden. Bereits bestellte Optimierungen bleiben
                      bestehen.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="secondary">Abbrechen</Button>
                    <Button variant="destructive">Datei löschen</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Rule>
              Dialoge nur für Entscheidungen, die den vollen Fokus brauchen – Bestätigungen,
              kurze Formulare, kritische Schritte. Titel als kurze Frage oder Aussage, die
              Beschreibung erklärt die Folgen. Die zerstörerische Aktion steht rechts und trägt
              die destructive-Variante.
            </Rule>
          </Section>

          <Section id="dropdown" kicker="13 – Komponenten" title="Dropdown-Menü">
            <div className="rounded-lg border bg-card p-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Anfrage bearbeiten</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Anfrage vom 21.10.2026</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Details ansehen</DropdownMenuItem>
                  <DropdownMenuItem>Datei erneut hochladen</DropdownMenuItem>
                  <DropdownMenuItem>Status anzeigen</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Anfrage zurückziehen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Rule>
              Dropdown-Menüs bündeln sekundäre Aktionen an einem Datensatz, damit die Oberfläche
              ruhig bleibt. Zerstörerische Einträge stehen ganz unten, abgetrennt und in
              destructive. Für die Hauptaktion einer Seite ist ein Menü nie der richtige Ort –
              dafür gibt es den primären Button.
            </Rule>
          </Section>

          <Section id="accordion" kicker="14 – Komponenten" title="Accordion">
            <div className="max-w-2xl rounded-lg border bg-card px-5">
              <Accordion type="single" collapsible defaultValue="lieferung">
                <AccordionItem value="lieferung">
                  <AccordionTrigger>Wie lange dauert die Lieferung?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Die optimierte Datei liegt in der Regel innerhalb von 24 Stunden bereit. Bei
                    Neuentwicklungen oder seltenen Steuergeräten nennen wir dir den Termin vorher.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="garantie">
                  <AccordionTrigger>Was passiert mit der Herstellergarantie?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Bewahre die Originaldatei immer auf. So stellst du den Serienzustand in wenigen
                    Minuten wieder her – etwa vor einer Hauptuntersuchung oder einer Reklamation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="dateien">
                  <AccordionTrigger>Welche Dateien kann ich hochladen?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Original-Auslesedaten im Format .bin, .ori oder .frf bis 20 MB. Bei Fragen zur
                    Auslese hilft dir der Support weiter.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <Rule>
              Accordions bündeln Fragen- und Antwortlisten, damit eine Seite kurz bleibt. Ein Eintrag
              trägt genau eine Frage, die Antwort bleibt bei zwei bis vier Sätzen. Handlungen wie
              „Paket wählen" gehören nicht in einen Accordion-Inhalt – der Text wird gelesen, nicht
              geklickt.
            </Rule>
          </Section>

          <Section id="tooltip" kicker="15 – Komponenten" title="Tooltip">
            <TooltipProvider delayDuration={200}>
              <div className="max-w-2xl space-y-5 rounded-lg border bg-card p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Lieferzeit erklärt">
                        <Info aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Lieferzeit in Werktagen – ab Eingang deiner Originaldatei.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Stage 1</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Reine Softwareoptimierung ohne Eingriff in die Hardware.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Lieferstatus</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Eröffnet am 21.10.2026 – die Bearbeitung läuft.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted underline-offset-4">
                      Prüfstand-erprobte Kennfelder
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      Jeder Datensatz wird vor der Freigabe auf dem Rollenprüfstand nachgemessen.
                    </TooltipContent>
                  </Tooltip>{" "}
                  heißt: Wir liefern keine Werte aus einer Datenbank, sondern messen nach.
                </p>
              </div>
            </TooltipProvider>
            <Rule>
              Tooltips erklären ein einzelnes Wort oder Icon in höchstens zwei Zeilen – ohne Aktionen,
              Links oder Pflichtinfos. Sie erscheinen nach kurzer Verzögerung bei Hover und
              Tastaturfokus und sind auf Mobilgeräten nicht verlässlich. Deaktivierte Elemente lösen
              kein Tooltip aus; was der Leser sicher sehen muss, steht im Feld, in einem Alert oder
              direkt im Text.
            </Rule>
          </Section>

          <Section id="toast" kicker="16 – Komponenten" title="Toast">
            <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-6">
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Datei hochgeladen", {
                    description: "Du erhältst die optimierte Datei bis zum 22.10.2026.",
                  })
                }
              >
                Erfolg melden
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error("Upload abgelehnt", {
                    description: "Die Datei ist größer als 20 MB. Bitte komprimiere sie.",
                  })
                }
              >
                Fehler melden
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.warning("Anfrage läuft ab", {
                    description: "Ohne Bearbeitung schließen wir am 28.10.2026.",
                  })
                }
              >
                Warnung melden
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Neues Modell verfügbar", {
                    description: "Für den 2.0 TFSI Gen. 3 liegt jetzt eine Datei vor.",
                  })
                }
              >
                Hinweis anzeigen
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast("Entwurf gespeichert", {
                    description: "Du kannst ihn jederzeit weiterbearbeiten.",
                    action: {
                      label: "Rückgängig",
                      onClick: () => toast.success("Entwurf verworfen"),
                    },
                  })
                }
              >
                Mit Rücknahme
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const toastId = toast.loading("Datei wird geprüft …");
                  setTimeout(
                    () =>
                      toast.success("Prüfung bestanden", {
                        id: toastId,
                        description: "Die Datei ist bereit zur Optimierung.",
                      }),
                    1200,
                  );
                }}
              >
                Prüfung starten
              </Button>
            </div>
            <Rule>
              Ein Toast meldet das Ergebnis einer Aktion, die gerade passiert ist: kurzer Titel, eine
              beschreibende Zeile, höchstens eine Rücknahme-Aktion. Er verschwindet von selbst und
              verlangt keinen Klick. Bleibende Infos laufen über Alert, Entscheidungen über Dialog.
              Der Toast-Ausgabebehälter hängt einmal im Wurzel-Layout und folgt dem aktiven Schema.
            </Rule>
          </Section>

          <Section id="regeln" kicker="17 – Regeln" title="Ton und Sprache">
            <div className="rounded-lg border bg-card p-6">
              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>Deutsch mit „du", freundlich und professionell, Satzschreibung in Überschriften und Buttons.</li>
                <li>Technische Angaben mit Einheiten und deutscher Zahlenformatierung: 1.234,56.</li>
                <li>Datumsformat immer DD.MM.YYYY.</li>
                <li>Keine Platzhaltertexte – jede Zeile auf der Seite ist echte, prüfbare Aussage.</li>
                <li>Ein Akzent: Tuning-Rot. Keine Verläufe, keine Glüheffekte, keine weiteren Signalfarben außer success und destructive.</li>
              </ul>
            </div>
          </Section>
        </main>

        <footer className="border-t py-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 text-sm text-muted-foreground">
            <span>Tuningfiles-download.com – Designsystem</span>
            <Link to="/" className="text-primary hover:underline">
              Zurück zur Startseite
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
