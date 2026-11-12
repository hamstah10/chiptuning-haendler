/**
 * Offer icons as single-colour SVG markup.
 *
 * The portal ships these as two-tone files (grey + its own red). They are stored
 * locally as `fill="currentColor"` so the site's brand red from the design tokens
 * colours them, in light and dark mode, without a cross-origin tint filter.
 */
import adblue from "@/assets/wizard-icons/adblue.svg?raw";
import agr from "@/assets/wizard-icons/agr.svg?raw";
import coding from "@/assets/wizard-icons/coding.svg?raw";
import diagnose from "@/assets/wizard-icons/diagnose.svg?raw";
import dpf from "@/assets/wizard-icons/dpf.svg?raw";
import dsg from "@/assets/wizard-icons/dsg.svg?raw";
import eco from "@/assets/wizard-icons/eco.svg?raw";
import hardcut from "@/assets/wizard-icons/hardcut.svg?raw";
import pops from "@/assets/wizard-icons/pops.svg?raw";
import stage1 from "@/assets/wizard-icons/stage1.svg?raw";
import stage2 from "@/assets/wizard-icons/stage2.svg?raw";
import vmax from "@/assets/wizard-icons/vmax.svg?raw";

/** Icon markup per portal answer value of the "services" question. */
export const SERVICE_ICON_SVG: Record<string, string> = {
  adblue,
  agr,
  coding,
  diagnose,
  dpf,
  dsg,
  eco,
  hardcut,
  pops,
  stage1,
  stage2,
  vmax,
};
