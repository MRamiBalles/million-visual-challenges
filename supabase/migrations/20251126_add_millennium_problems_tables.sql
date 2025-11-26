-- Migration: Add Millennium Problems Core Tables
-- Created: 2025-11-26
-- Description: Tables for academic content, research papers, visualizations, and learning progress

-- ==============================================
-- 1. MILLENNIUM PROBLEMS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.millennium_problems (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT,
  field TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT CHECK (status IN ('solved', 'unsolved')) NOT NULL,
  solver TEXT,
  solver_year INTEGER,
  prize TEXT NOT NULL,
  
  -- Descriptions at different levels
  description_simple TEXT NOT NULL,
  description_intermediate TEXT NOT NULL,
  description_advanced TEXT NOT NULL,
  
  -- Clay Mathematics Institute official paper
  clay_paper_author TEXT NOT NULL,
  clay_paper_year INTEGER NOT NULL,
  clay_paper_url TEXT NOT NULL,
  
  -- Metadata
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_millennium_problems_slug ON public.millennium_problems(slug);
CREATE INDEX idx_millennium_problems_status ON public.millennium_problems(status);

-- ==============================================
-- 2. RESEARCH PAPERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  
  -- Paper metadata
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  year INTEGER,
  arxiv_id TEXT,
  doi TEXT,
  abstract TEXT,
  pdf_url TEXT,
  source_url TEXT,
  
  -- Citation data
  citations_count INTEGER DEFAULT 0,
  
  -- AI-generated content
  ai_summary TEXT,
  ai_key_insights TEXT[],
  is_ai_verified BOOLEAN DEFAULT FALSE,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT research_papers_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 500)
);

-- Indexes
CREATE INDEX idx_research_papers_problem ON public.research_papers(problem_id);
CREATE INDEX idx_research_papers_arxiv ON public.research_papers(arxiv_id) WHERE arxiv_id IS NOT NULL;
CREATE INDEX idx_research_papers_doi ON public.research_papers(doi) WHERE doi IS NOT NULL;
CREATE INDEX idx_research_papers_year ON public.research_papers(year DESC);
CREATE INDEX idx_research_papers_verified ON public.research_papers(is_verified) WHERE is_verified = TRUE;

-- ==============================================
-- 3. KEY REFERENCES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.key_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  year INTEGER NOT NULL,
  url TEXT NOT NULL,
  citations INTEGER DEFAULT 0,
  description TEXT,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT key_references_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 500)
);

CREATE INDEX idx_key_references_problem ON public.key_references(problem_id, display_order);

-- ==============================================
-- 4. VISUALIZATIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('3d', '2d', 'interactive', 'simulation', 'chart')) NOT NULL,
  
  -- Configuration (stores visualization-specific parameters)
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Assets
  thumbnail_url TEXT,
  component_path TEXT, -- React component path
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT visualizations_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200)
);

CREATE INDEX idx_visualizations_problem ON public.visualizations(problem_id, display_order);
CREATE INDEX idx_visualizations_type ON public.visualizations(type);
CREATE INDEX idx_visualizations_active ON public.visualizations(is_active) WHERE is_active = TRUE;

-- ==============================================
-- 5. APPLICATIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  field TEXT NOT NULL,
  examples TEXT[],
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT applications_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200)
);

CREATE INDEX idx_applications_problem ON public.applications(problem_id, display_order);

-- ==============================================
-- 6. USER PROGRESS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE NOT NULL,
  
  -- Progress tracking
  current_level TEXT CHECK (current_level IN ('simple', 'intermediate', 'advanced')) DEFAULT 'simple',
  completed_sections JSONB DEFAULT '[]'::jsonb, -- Array of section IDs
  total_time_spent INTEGER DEFAULT 0, -- seconds
  
  -- Engagement
  bookmarked BOOLEAN DEFAULT FALSE,
  last_visited_at TIMESTAMPTZ,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_problem ON public.user_progress(problem_id);
CREATE INDEX idx_user_progress_bookmarked ON public.user_progress(user_id) WHERE bookmarked = TRUE;

-- ==============================================
-- 7. DISCUSSIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT,
  content TEXT NOT NULL,
  latex_content TEXT, -- Raw LaTeX for mathematical content
  
  -- Engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT discussions_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000),
  CONSTRAINT discussions_title_length CHECK (title IS NULL OR (char_length(title) >= 1 AND char_length(title) <= 300))
);

CREATE INDEX idx_discussions_problem ON public.discussions(problem_id, created_at DESC);
CREATE INDEX idx_discussions_user ON public.discussions(user_id);
CREATE INDEX idx_discussions_parent ON public.discussions(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_discussions_verified ON public.discussions(is_verified) WHERE is_verified = TRUE;

-- ==============================================
-- 8. DISCUSSION VOTES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.discussion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(discussion_id, user_id)
);

CREATE INDEX idx_discussion_votes_discussion ON public.discussion_votes(discussion_id);
CREATE INDEX idx_discussion_votes_user ON public.discussion_votes(user_id);

-- ==============================================
-- 9. AI UPDATES LOG TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.ai_updates_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  
  update_type TEXT CHECK (update_type IN ('paper_summary', 'qa_answer', 'content_generation')) NOT NULL,
  source TEXT, -- e.g., 'arxiv', 'user_question'
  source_id TEXT, -- e.g., arxiv ID, question ID
  
  -- AI metadata
  model_used TEXT, -- e.g., 'gpt-4-turbo-preview'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost DECIMAL(10, 6),
  
  -- Result
  result JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_updates_log_problem ON public.ai_updates_log(problem_id);
CREATE INDEX idx_ai_updates_log_type ON public.ai_updates_log(update_type);
CREATE INDEX idx_ai_updates_log_created ON public.ai_updates_log(created_at DESC);

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Update updated_at timestamps
CREATE TRIGGER update_millennium_problems_updated_at
  BEFORE UPDATE ON public.millennium_problems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_papers_updated_at
  BEFORE UPDATE ON public.research_papers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visualizations_updated_at
  BEFORE UPDATE ON public.visualizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update discussion vote counts
CREATE OR REPLACE FUNCTION public.update_discussion_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.discussions SET upvotes = upvotes + 1 WHERE id = NEW.discussion_id;
    ELSE
      UPDATE public.discussions SET downvotes = downvotes + 1 WHERE id = NEW.discussion_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.discussions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.discussion_id;
    ELSE
      UPDATE public.discussions SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.discussion_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote type change
    IF OLD.vote_type != NEW.vote_type THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE public.discussions 
        SET upvotes = GREATEST(0, upvotes - 1), downvotes = downvotes + 1 
        WHERE id = NEW.discussion_id;
      ELSE
        UPDATE public.discussions 
        SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) 
        WHERE id = NEW.discussion_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER discussion_votes_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.discussion_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_discussion_votes_count();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.millennium_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_updates_log ENABLE ROW LEVEL SECURITY;

-- Millennium Problems: Everyone can read
CREATE POLICY "Anyone can view millennium problems"
  ON public.millennium_problems FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify millennium problems"
  ON public.millennium_problems FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Research Papers: Everyone can read, authenticated users can submit
CREATE POLICY "Anyone can view verified research papers"
  ON public.research_papers FOR SELECT
  USING (is_verified = TRUE OR added_by = auth.uid());

CREATE POLICY "Authenticated users can submit papers"
  ON public.research_papers FOR INSERT
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update their own papers"
  ON public.research_papers FOR UPDATE
  USING (auth.uid() = added_by);

CREATE POLICY "Admins can manage all papers"
  ON public.research_papers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Key References: Everyone can read, admins can modify
CREATE POLICY "Anyone can view key references"
  ON public.key_references FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify key references"
  ON public.key_references FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Visualizations: Everyone can view active ones
CREATE POLICY "Anyone can view active visualizations"
  ON public.visualizations FOR SELECT
  USING (is_active = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can create visualizations"
  ON public.visualizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage all visualizations"
  ON public.visualizations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Applications: Everyone can read, admins can modify
CREATE POLICY "Anyone can view applications"
  ON public.applications FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify applications"
  ON public.applications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- User Progress: Users can only access their own
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Discussions: Everyone can read, authenticated users can post
CREATE POLICY "Anyone can view discussions"
  ON public.discussions FOR SELECT
  USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON public.discussions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate discussions"
  ON public.discussions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Discussion Votes: Users can manage their own votes
CREATE POLICY "Anyone can view votes"
  ON public.discussion_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own votes"
  ON public.discussion_votes FOR ALL
  USING (auth.uid() = user_id);

-- AI Updates Log: Admins only
CREATE POLICY "Admins can view AI updates log"
  ON public.ai_updates_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "System can insert AI updates"
  ON public.ai_updates_log FOR INSERT
  WITH CHECK (true); -- Edge functions will handle this

-- ==============================================
-- COMMENTS
-- ==============================================

COMMENT ON TABLE public.millennium_problems IS 'Core table containing the 7 Millennium Prize Problems';
COMMENT ON TABLE public.research_papers IS 'Academic papers related to the problems, with AI-generated summaries';
COMMENT ON TABLE public.key_references IS 'Curated essential references for each problem';
COMMENT ON TABLE public.visualizations IS 'Interactive visualizations configuration for each problem';
COMMENT ON TABLE public.applications IS 'Real-world applications of each problem';
COMMENT ON TABLE public.user_progress IS 'Track user learning progress and engagement';
COMMENT ON TABLE public.discussions IS 'Community discussions and Q&A with LaTeX support';
COMMENT ON TABLE public.discussion_votes IS 'Upvotes/downvotes for discussions';
COMMENT ON TABLE public.ai_updates_log IS 'Log of all AI-generated content updates and costs';
