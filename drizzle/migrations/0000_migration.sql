CREATE TABLE public.dealer_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('wizard','configurator')),
  locale text NOT NULL DEFAULT 'de',
  company text,
  contact_name text NOT NULL,
  email text,
  phone text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT ALL ON public.dealer_leads TO service_role;
ALTER TABLE public.dealer_leads ENABLE ROW LEVEL SECURITY;