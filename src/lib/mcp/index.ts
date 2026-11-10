import { auth, defineMcp } from "@lovable.dev/mcp-js";
import dealerInformation from "./tools/dealer-information";
import calculateEarnings from "./tools/calculate-earnings";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";
export default defineMcp({
  name: "chiptuning-haendler",
  title: "Chiptuning Haendler",
  version: "0.1.0",
  instructions: "Read published dealer packages and calculate illustrative earnings. No access to leads, review notes, vehicle API credentials or browser-saved plans. OAuth login is required.",
  auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: "authenticated", requireOAuthClientClaim: true }),
  tools: [dealerInformation, calculateEarnings],
});