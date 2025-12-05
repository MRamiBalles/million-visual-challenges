-- Add is_public column to profiles table for visibility control
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Drop the old overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policies for profile visibility
-- Users can always see their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view other profiles only if they are public AND the viewer is authenticated
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
USING (is_public = true AND auth.uid() IS NOT NULL);