CREATE OR REPLACE FUNCTION public.reconcile_whatsapp() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s record; m record; ranks jsonb := '{"sending":0,"accepted":1,"sent":2,"delivered":3,"read":4,"failed":5}';
BEGIN
FOR s IN SELECT st.* FROM public.whatsapp_statuses st WHERE st.applied_at IS NULL AND EXISTS(SELECT 1 FROM public.whatsapp_messages mm WHERE mm.provider_id=st.provider_id) ORDER BY st.provider_time NULLS LAST,st.delivery_id,st.ordinal LIMIT 200 FOR UPDATE SKIP LOCKED LOOP
SELECT * INTO m FROM public.whatsapp_messages WHERE provider_id=s.provider_id FOR UPDATE;
IF FOUND THEN
UPDATE public.whatsapp_messages SET state=CASE WHEN COALESCE((ranks->>s.state)::int,0)>=COALESCE((ranks->>state)::int,0) THEN s.state ELSE state END, error=COALESCE(s.errors,error), status_times=CASE WHEN s.provider_time IS NOT NULL AND NOT(status_times ? s.state) THEN status_times||jsonb_build_object(s.state,s.provider_time) ELSE status_times END WHERE id=m.id;
UPDATE public.whatsapp_statuses SET applied_at=now() WHERE delivery_id=s.delivery_id AND ordinal=s.ordinal;
END IF;
END LOOP; END $$;
REVOKE ALL ON FUNCTION public.reconcile_whatsapp() FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.reconcile_whatsapp() TO service_role;