CREATE TABLE public.section_reviews (
  section_id text PRIMARY KEY,
  decision text CHECK (decision IN ('ja','nein','vielleicht')),
  comment text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.section_reviews TO service_role;
ALTER TABLE public.section_reviews ENABLE ROW LEVEL SECURITY;