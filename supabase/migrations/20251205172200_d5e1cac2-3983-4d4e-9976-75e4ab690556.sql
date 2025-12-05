-- Fix user_statistics: it's a view, so we need to add RLS via security_invoker
-- First check if it's already a security invoker view, if not recreate it
DROP VIEW IF EXISTS public.user_statistics;

CREATE VIEW public.user_statistics
WITH (security_invoker = true)
AS
SELECT 
    up.user_id,
    COUNT(DISTINCT up.problem_id) as problems_visited,
    COALESCE(SUM(up.total_time_spent), 0)::integer as total_time_seconds,
    COUNT(CASE WHEN up.bookmarked THEN 1 END)::integer as bookmarks_count,
    COALESCE((SELECT COUNT(*) FROM public.user_achievements ua WHERE ua.user_id = up.user_id), 0)::integer as achievements_count,
    COALESCE((SELECT SUM(a.points) FROM public.user_achievements ua JOIN public.achievements a ON ua.achievement_id = a.id WHERE ua.user_id = up.user_id), 0)::integer as total_points,
    MAX(up.last_visited_at) as last_active_at
FROM public.user_progress up
GROUP BY up.user_id;