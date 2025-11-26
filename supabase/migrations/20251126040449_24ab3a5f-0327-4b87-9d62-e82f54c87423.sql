-- Create achievements table (separate from badges for gamification)
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  category text NOT NULL CHECK (category IN ('learning', 'progress', 'community', 'research')),
  points integer NOT NULL DEFAULT 0,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Anyone can view achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own achievements
CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id integer NOT NULL REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  current_level text NOT NULL DEFAULT 'simple' CHECK (current_level IN ('simple', 'intermediate', 'advanced')),
  completed_sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_time_spent integer NOT NULL DEFAULT 0,
  bookmarked boolean NOT NULL DEFAULT false,
  last_visited_at timestamptz NOT NULL DEFAULT now(),
  completion_percentage integer NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own progress"
  ON public.user_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_statistics view
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
  up.user_id,
  COUNT(DISTINCT up.problem_id) as problems_visited,
  COALESCE(SUM(up.total_time_spent), 0)::integer as total_time_seconds,
  COUNT(DISTINCT CASE WHEN up.bookmarked THEN up.problem_id END)::integer as bookmarks_count,
  COUNT(DISTINCT ua.achievement_id)::integer as achievements_count,
  COALESCE(SUM(a.points), 0)::integer as total_points,
  MAX(up.last_visited_at) as last_active_at
FROM public.user_progress up
LEFT JOIN public.user_achievements ua ON ua.user_id = up.user_id
LEFT JOIN public.achievements a ON a.id = ua.achievement_id
GROUP BY up.user_id;

-- Grant access to the view
GRANT SELECT ON public.user_statistics TO authenticated;

-- Add trigger for updated_at on user_progress
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_problem_id ON public.user_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);