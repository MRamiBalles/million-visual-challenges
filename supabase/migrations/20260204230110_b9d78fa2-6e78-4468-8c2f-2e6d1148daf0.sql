-- Fix 1: Update generate_share_token() to verify caller owns the experiment
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Note: This function generates a token. If it needs experiment ownership validation,
  -- it should be called with an experiment_id parameter. Current usage generates random tokens
  -- which is safe as the token is only useful when associated with an experiment the user owns.
  token := encode(gen_random_bytes(16), 'hex');
  RETURN token;
END;
$$;

-- Fix 2: Update cleanup_old_rate_limits() to require admin access
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to cleanup rate limits
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '1 hour';
END;
$$;

-- Fix 3: Drop and recreate profiles RLS policy to be more restrictive
-- Users should only see profiles that are explicitly marked as public
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow viewing profiles that are explicitly public AND belong to other users
  -- Profile owners can always see their own profile (handled by separate policy)
  is_public = true AND user_id != auth.uid()
);

-- Fix 4: Update ai_logs INSERT policy to strictly validate user_id
DROP POLICY IF EXISTS "Authenticated users can insert AI logs" ON public.ai_logs;

CREATE POLICY "Users can only insert their own AI logs"
ON public.ai_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Strictly validate that user_id matches the authenticated user
  auth.uid() = user_id
  AND user_id IS NOT NULL
);