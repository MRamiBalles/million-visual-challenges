-- =====================================================
-- Performance Indexes for High-Traffic Tables
-- =====================================================

-- Index for user_activity: Optimizes queries filtering by user and date
-- Common query pattern: SELECT * FROM user_activity WHERE user_id = ? AND session_date = ?
CREATE INDEX IF NOT EXISTS idx_user_activity_user_session 
ON public.user_activity (user_id, session_date DESC);

-- Index for experiments: Optimizes queries for public feeds and user listings
-- Common query pattern: SELECT * FROM experiments WHERE is_public = true ORDER BY created_at
-- Also optimizes: SELECT * FROM experiments WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_experiments_user_public 
ON public.experiments (user_id, is_public);

-- Additional index for public experiment feeds sorted by popularity
CREATE INDEX IF NOT EXISTS idx_experiments_public_likes 
ON public.experiments (is_public, likes_count DESC) 
WHERE is_public = true;

-- Index for rate_limits cleanup (used by scheduled cleanup function)
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at 
ON public.rate_limits (created_at);

-- Index for notifications: Optimizes unread notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, read) 
WHERE read = false;