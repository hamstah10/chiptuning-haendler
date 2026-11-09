import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reviewSchema = z.object({
  sectionId: z.string().trim().min(1).max(100),
  decision: z.enum(["ja", "nein", "vielleicht"]).nullable().optional(),
  comment: z.string().max(5000).default(""),
  note: z.string().max(5000).default(""),
});

export const listSectionReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("section_reviews")
    .select("section_id, decision, comment, note");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const saveSectionReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reviewSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("section_reviews").upsert({
      section_id: data.sectionId,
      decision: data.decision ?? null,
      comment: data.comment,
      note: data.note,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
