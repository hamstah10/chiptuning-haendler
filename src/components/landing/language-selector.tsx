import { Link } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Locale } from "@/lib/format";
import germanFlag from "@/assets/flag-de.svg";
import englishFlag from "@/assets/flag-gb.svg";

const languages = [
  { locale: "de", label: "Deutsch", flag: germanFlag },
  { locale: "en", label: "English", flag: englishFlag },
] as const;
const destinations = {
  home: { de: "/", en: "/en" },
  startplan: { de: "/startplan", en: "/en/startplan" },
  imprint: { de: "/impressum", en: "/en/imprint" },
  privacy: { de: "/datenschutz", en: "/en/privacy" },
} as const;

export function LanguageSelector({ locale, page = "home" }: { locale: Locale; page?: keyof typeof destinations }) {
  const current = languages.find((language) => language.locale === locale) ?? languages[0];
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" aria-label={locale === "de" ? "Sprache auswählen" : "Select language"} className="shrink-0 gap-2 rounded-sm text-xs">
        <img src={current.flag} alt="" width={24} height={16} className="h-4 w-6 rounded-sm object-cover" />
        <span>{current.label}</span><ChevronDown className="size-3" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      {languages.map((language) => <DropdownMenuItem key={language.locale} asChild>
        <Link to={destinations[page][language.locale]} hrefLang={language.locale} lang={language.locale} aria-current={locale === language.locale ? "true" : undefined} className="gap-2">
          <img src={language.flag} alt="" width={24} height={16} className="h-4 w-6 rounded-sm object-cover" />
          <span>{language.label}</span>{locale === language.locale && <Check className="ml-auto size-4 text-primary" />}
        </Link>
      </DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>;
}