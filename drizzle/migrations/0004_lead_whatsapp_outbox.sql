ALTER TABLE public.whatsapp_messages ADD COLUMN lead_id uuid REFERENCES public.dealer_leads(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX whatsapp_messages_lead_id_unique ON public.whatsapp_messages(lead_id) WHERE lead_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.queue_lead_whatsapp_notification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.whatsapp_messages(lead_id, request_id, phone, direction, kind, body, state)
  VALUES (NEW.id, NEW.id, '4915228076375', 'outbound', 'template', 'Neue Händleranfrage: ' || NEW.contact_name, 'pending_template');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.queue_lead_whatsapp_notification() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER queue_lead_whatsapp_notification AFTER INSERT ON public.dealer_leads FOR EACH ROW EXECUTE FUNCTION public.queue_lead_whatsapp_notification();