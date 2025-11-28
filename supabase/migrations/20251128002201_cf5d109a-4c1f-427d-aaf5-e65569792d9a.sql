-- Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS research_interests text[],
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Create index on research_interests for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_research_interests 
  ON public.profiles USING GIN(research_interests);