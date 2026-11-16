CREATE TABLE public.ai_threads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL DEFAULT 'Nova conversa', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_threads TO authenticated; GRANT ALL ON public.ai_threads TO service_role;
ALTER TABLE public.ai_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_threads ON public.ai_threads FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE TABLE public.ai_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), thread_id uuid NOT NULL REFERENCES public.ai_threads(id) ON DELETE CASCADE, user_id uuid NOT NULL, sdk_id text NOT NULL, message jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(thread_id,sdk_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_messages TO authenticated; GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_messages ON public.ai_messages FOR ALL TO authenticated USING (user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.ai_threads t WHERE t.id=thread_id AND t.user_id=auth.uid())) WITH CHECK (user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.ai_threads t WHERE t.id=thread_id AND t.user_id=auth.uid()));
CREATE INDEX ai_message_order ON public.ai_messages(thread_id,created_at);
CREATE TABLE public.ai_free_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_free_requests TO service_role;
ALTER TABLE public.ai_free_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_free_request_time ON public.ai_free_requests(created_at);
CREATE FUNCTION public.reserve_free_ai_request() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF auth.uid() IS NULL THEN RETURN false; END IF;
PERFORM pg_advisory_xact_lock(803147);
IF (SELECT count(*) FROM public.ai_free_requests WHERE created_at >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') >= 50 OR (SELECT count(*) FROM public.ai_free_requests WHERE created_at > now()-interval '1 minute') >= 20 THEN RETURN false; END IF;
INSERT INTO public.ai_free_requests(user_id) VALUES(auth.uid()); RETURN true; END; $$;
REVOKE ALL ON FUNCTION public.reserve_free_ai_request() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.reserve_free_ai_request() TO authenticated;