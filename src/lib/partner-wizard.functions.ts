import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Optional server-side API token (Authorization: Bearer pw_…); never sent to the browser. */
function portalHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json", "X-TFD-Client": "tfd" };
  const token = process.env.TFD_PARTNER_WIZARD_TOKEN;
  if (token) h["Authorization"] = `Bearer ${token}`;
  else h["Origin"] = "https://www.chiptuning.company";
  return h;
}

const PORTAL_LEADS_URL = "https://portal.dct-files.de/api/tfd-partner-wizard/leads";

/** Server-side proxy: the portal sends no CORS headers on lead submissions. */
export const submitPartnerWizardLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.record(z.string(), z.unknown()).parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(PORTAL_LEADS_URL, {
      method: "POST",
      headers: portalHeaders(),
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

const ALLOWED_PATHS = [
  /^\/api\/tfd-partner-wizard\/config\/tfd$/,
  /^\/api\/tfd-partner-wizard\/appointments\/tfd$/,
  /^\/api\/tfd-partner-wizard\/recommend$/,
];

/** Server-side proxy for read endpoints: the portal rejects browser origins. */
export const partnerWizardProxy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().refine((p) => ALLOWED_PATHS.some((r) => r.test(p))), body: z.unknown().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`https://portal.dct-files.de${data.path}`, {
      method: data.body === undefined ? "GET" : "POST",
      headers: portalHeaders(),
      body: data.body === undefined ? null : JSON.stringify(data.body),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, json: JSON.stringify(json) };
  });
