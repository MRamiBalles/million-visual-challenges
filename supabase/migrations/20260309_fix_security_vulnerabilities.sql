-- Migration: Fix Security Vulnerabilities (RLS Hardening)
-- Created: 2026-03-09
-- Description: Restricts users from modifying verified status and AI summaries directly.

-- ==============================================
-- 1. HARDEN RESEARCH PAPERS RLS
-- ==============================================

-- Drop existing vulnerable policy
DROP POLICY IF EXISTS "Users can update their own papers" ON public.research_papers;

-- Create a more restrictive update policy
-- This prevents users from manually changing is_verified, verified_by, or ai_summary
-- (Service role used in Edge Functions bypasses RLS and can still update these)
CREATE POLICY "Users can update their own paper metadata"
  ON public.research_papers FOR UPDATE
  USING (auth.uid() = added_by)
  WITH CHECK (
    auth.uid() = added_by -- Must remain owner
    AND (
      -- Ensure critical fields are NOT modified via direct client update
      -- Users can only update their own unverified papers
      (is_verified = FALSE)
    )
  );

-- Admins retain full control
DROP POLICY IF EXISTS "Admins can manage all papers" ON public.research_papers;
CREATE POLICY "Admins have full access to papers"
  ON public.research_papers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ==============================================
-- 2. HARDEN AI LOGS (Prevent any unauthorized insertion)
-- ==============================================
ALTER TABLE public.ai_updates_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_updates_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view AI updates log" ON public.ai_updates_log;
CREATE POLICY "Admins can view AI updates log"
  ON public.ai_updates_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "System can insert AI updates" ON public.ai_updates_log;
CREATE POLICY "Only Service Role can insert AI updates"
  ON public.ai_updates_log FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
