import { useEffect, useRef } from "react";

const EMBED_SRC = "https://portal.dct-files.de/widgets/partner-wizard/embed.js";

/**
 * External partner wizard (portal.dct-files.de). The embed script inserts a
 * <tfd-partner-wizard> element right after its own script tag, so we append
 * the script into a local container once the component has mounted.
 */
export function PartnerWizardEmbed() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.querySelector("tfd-partner-wizard")) return;
    const script = document.createElement("script");
    script.src = EMBED_SRC;
    script.async = true;
    script.setAttribute("data-client-id", "tfd");
    script.setAttribute("data-primary-color", "#E41D24");
    script.setAttribute("data-theme", "light");
    host.appendChild(script);
    return () => {
      script.remove();
      host.replaceChildren();
    };
  }, []);

  return <div ref={hostRef} className="partner-wizard-embed" />;
}
