CREATE TABLE public.whatsapp_access (user_id uuid primary key, created_at timestamptz not null default now());
GRANT SELECT ON public.whatsapp_access TO authenticated; GRANT ALL ON public.whatsapp_access TO service_role;
ALTER TABLE public.whatsapp_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_access ON public.whatsapp_access FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.can_use_whatsapp() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.whatsapp_access WHERE user_id=auth.uid()) $$;
REVOKE ALL ON FUNCTION public.can_use_whatsapp() FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.can_use_whatsapp() TO authenticated,service_role;
CREATE TABLE public.whatsapp_webhook_events (delivery_id text primary key, event text not null, payload jsonb not null, received_at timestamptz not null default now(), processed_at timestamptz, processing_error text, next_attempt_at timestamptz not null default now(), attempts integer not null default 0);
GRANT SELECT ON public.whatsapp_webhook_events TO authenticated; GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read ON public.whatsapp_webhook_events FOR SELECT TO authenticated USING(public.can_use_whatsapp());
CREATE INDEX whatsapp_pending ON public.whatsapp_webhook_events(next_attempt_at) WHERE processed_at IS NULL;
CREATE TABLE public.whatsapp_messages (id uuid primary key default gen_random_uuid(), provider_id text unique, request_id uuid unique, phone text not null, direction text not null CHECK(direction IN ('inbound','outbound')), body text not null default '', kind text not null default 'text', media_id text, media jsonb, state text not null default 'received', provider_time timestamptz, created_at timestamptz not null default now(), error jsonb, status_times jsonb not null default '{}');
GRANT SELECT ON public.whatsapp_messages TO authenticated; GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read ON public.whatsapp_messages FOR SELECT TO authenticated USING(public.can_use_whatsapp());
CREATE INDEX whatsapp_phone ON public.whatsapp_messages(phone,created_at);
CREATE TABLE public.whatsapp_statuses (delivery_id text not null, ordinal integer not null, provider_id text not null, state text not null, provider_time timestamptz, errors jsonb, applied_at timestamptz, primary key(delivery_id,ordinal));
GRANT SELECT ON public.whatsapp_statuses TO authenticated; GRANT ALL ON public.whatsapp_statuses TO service_role;
ALTER TABLE public.whatsapp_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read ON public.whatsapp_statuses FOR SELECT TO authenticated USING(public.can_use_whatsapp());
CREATE TABLE public.whatsapp_account (id boolean primary key default true CHECK(id), sending_enabled boolean not null default true, event text, updated_at timestamptz not null default now());
GRANT SELECT ON public.whatsapp_account TO authenticated; GRANT ALL ON public.whatsapp_account TO service_role;
ALTER TABLE public.whatsapp_account ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read ON public.whatsapp_account FOR SELECT TO authenticated USING(public.can_use_whatsapp());
CREATE FUNCTION public.reconcile_whatsapp() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s record; m record; ranks jsonb := '{"sending":0,"accepted":1,"sent":2,"delivered":3,"read":4,"failed":5}';
BEGIN
FOR s IN SELECT * FROM public.whatsapp_statuses WHERE applied_at IS NULL ORDER BY provider_time NULLS LAST,delivery_id,ordinal LIMIT 200 FOR UPDATE SKIP LOCKED LOOP
SELECT * INTO m FROM public.whatsapp_messages WHERE provider_id=s.provider_id FOR UPDATE;
IF FOUND THEN
UPDATE public.whatsapp_messages SET state=CASE WHEN COALESCE((ranks->>s.state)::int,0)>=COALESCE((ranks->>state)::int,0) THEN s.state ELSE state END, error=COALESCE(s.errors,error), status_times=CASE WHEN s.provider_time IS NOT NULL AND NOT(status_times ? s.state) THEN status_times||jsonb_build_object(s.state,s.provider_time) ELSE status_times END WHERE id=m.id;
UPDATE public.whatsapp_statuses SET applied_at=now() WHERE delivery_id=s.delivery_id AND ordinal=s.ordinal;
END IF;
END LOOP; END $$;
REVOKE ALL ON FUNCTION public.reconcile_whatsapp() FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.reconcile_whatsapp() TO service_role;
CREATE FUNCTION public.process_whatsapp_events() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e record; v jsonb; msg jsonb; s jsonb; n integer; ev text;
BEGIN
FOR e IN SELECT * FROM public.whatsapp_webhook_events WHERE processed_at IS NULL AND next_attempt_at<=now() ORDER BY next_attempt_at,received_at LIMIT 20 FOR UPDATE SKIP LOCKED LOOP
BEGIN
v:=e.payload#>'{entry,0,changes,0,value}';
IF e.event IN ('whatsapp.message','whatsapp.smb_message_echoes') THEN
FOR msg IN SELECT value FROM jsonb_array_elements(COALESCE(v->'messages',v->'message_echoes','[]'::jsonb)) LOOP
INSERT INTO public.whatsapp_messages(provider_id,phone,direction,body,kind,media_id,media,provider_time,state) VALUES(msg->>'id',COALESCE(msg->>'from',msg->>'to'),CASE WHEN e.event='whatsapp.message' THEN 'inbound' ELSE 'outbound' END,COALESCE(msg#>>'{text,body}',msg#>>'{image,caption}',msg#>>'{document,caption}',''),COALESCE(msg->>'type','text'),msg->(msg->>'type')->>'id',msg->(msg->>'type'),to_timestamp((msg->>'timestamp')::double precision),CASE WHEN e.event='whatsapp.message' THEN 'received' ELSE 'sent' END) ON CONFLICT(provider_id) DO NOTHING;
END LOOP;
ELSIF e.event='whatsapp.status' THEN
n:=0; FOR s IN SELECT value FROM jsonb_array_elements(COALESCE(v->'statuses','[]'::jsonb)) LOOP
INSERT INTO public.whatsapp_statuses(delivery_id,ordinal,provider_id,state,provider_time,errors) VALUES(e.delivery_id,n,s->>'id',s->>'status',to_timestamp((s->>'timestamp')::double precision),s->'errors') ON CONFLICT DO NOTHING; n:=n+1;
END LOOP;
ELSIF e.event='whatsapp.account_update' THEN
ev:=v->>'event';
IF ev IN ('PARTNER_REMOVED','PARTNER_APP_UNINSTALLED','ACCOUNT_OFFBOARDED','ACCOUNT_RECONNECTED') OR (ev='DISABLED_UPDATE' AND v#>>'{ban_info,waba_ban_state}'='DISABLE') OR (ev='ACCOUNT_DELETED' AND regexp_replace(COALESCE(v->>'phone_number',''),'[^0-9]','','g')='15554625762') THEN
INSERT INTO public.whatsapp_account(id,sending_enabled,event) VALUES(true,ev='ACCOUNT_RECONNECTED',ev) ON CONFLICT(id) DO UPDATE SET sending_enabled=EXCLUDED.sending_enabled,event=EXCLUDED.event,updated_at=now();
END IF;
END IF;
UPDATE public.whatsapp_webhook_events SET processed_at=now(),processing_error=NULL,attempts=attempts+1 WHERE delivery_id=e.delivery_id;
EXCEPTION WHEN OTHERS THEN
UPDATE public.whatsapp_webhook_events SET processing_error=SQLERRM,attempts=attempts+1,next_attempt_at=now()+interval '30 seconds' WHERE delivery_id=e.delivery_id;
END;
END LOOP;
PERFORM public.reconcile_whatsapp();
END $$;
REVOKE ALL ON FUNCTION public.process_whatsapp_events() FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.process_whatsapp_events() TO service_role;