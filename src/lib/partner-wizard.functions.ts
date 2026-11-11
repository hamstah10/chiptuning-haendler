import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PORTAL_LEADS_URL = "https://portal.dct-files.de/api/tfd-partner-wizard/leads";

/** Server-side proxy: the portal sends no CORS headers on lead submissions. */
export const submitPartnerWizardLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.record(z.string(), z.unknown()).parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(PORTAL_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      console.error("Partner wizard lead rejected", res.status, body);
      const message = typeof body["error"] === "string" ? body["error"] : typeof body["message"] === "string" ? body["message"] : "";
      return { ok: false as const, status: res.status, message };
    }
    return { ok: true as const, status: res.status, message: typeof body["message"] === "string" ? body["message"] : "" };
  });
