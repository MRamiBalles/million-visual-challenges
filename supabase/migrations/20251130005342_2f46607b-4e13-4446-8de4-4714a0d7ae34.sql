-- Fix security definer view by enabling security invoker
-- This ensures the view respects RLS policies of the querying user
ALTER VIEW user_statistics SET (security_invoker = true);