-- Fix ai_logs security: restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "System can insert AI logs" ON public.ai_logs;

CREATE POLICY "Authenticated users can insert AI logs"
ON public.ai_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);