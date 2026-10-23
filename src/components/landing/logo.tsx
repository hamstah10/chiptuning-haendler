import logoColor from "@/assets/tuningfiles-logo-farbe.png.asset.json";
import logoWhite from "@/assets/tuningfiles-logo-weiss.png.asset.json";

/**
 * Brand logo (real brand asset): color version on light surfaces,
 * white version on dark surfaces — switched via the `.dark` class on <html>.
 */
export function Logo() {
  return (
    <span className="flex items-center">
      <img
        src={logoColor.url}
        alt="Tuningfiles-download.com"
        className="h-7 w-auto dark:hidden"
      />
      <img
        src={logoWhite.url}
        alt=""
        aria-hidden="true"
        className="hidden h-7 w-auto dark:block"
      />
    </span>
  );
}
