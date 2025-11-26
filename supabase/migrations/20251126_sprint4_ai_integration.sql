-- Sprint 4: AI Integration - Database Schema
-- Enables: Paper summarization, Q&A with RAG, embedding search

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Paper embeddings for semantic search (RAG)
CREATE TABLE IF NOT EXISTS paper_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS paper_embeddings_embedding_idx 
  ON paper_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for paper lookup
CREATE INDEX IF NOT EXISTS paper_embeddings_paper_id_idx 
  ON paper_embeddings(paper_id);

-- Q&A conversation history
CREATE TABLE IF NOT EXISTS qa_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES millennium_problems(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_papers UUID[], -- Papers used for context
  model TEXT DEFAULT 'gpt-4',
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Q&A history
CREATE INDEX IF NOT EXISTS qa_history_user_id_idx ON qa_history(user_id);
CREATE INDEX IF NOT EXISTS qa_history_problem_id_idx ON qa_history(problem_id);
CREATE INDEX IF NOT EXISTS qa_history_created_at_idx ON qa_history(created_at DESC);

-- AI generation logs for monitoring and cost tracking
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  function_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  model TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cost analysis
CREATE INDEX IF NOT EXISTS ai_logs_created_at_idx ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_logs_function_name_idx ON ai_logs(function_name);

-- Add ai_summary column to research_papers if not exists
ALTER TABLE research_papers 
  ADD COLUMN IF NOT EXISTS ai_summary JSONB;

-- Function for semantic search (RAG)
CREATE OR REPLACE FUNCTION match_paper_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  problem_filter int DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  paper_id uuid,
  chunk_text text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.paper_id,
    pe.chunk_text,
    pe.chunk_index,
    1 - (pe.embedding <=> query_embedding) as similarity
  FROM paper_embeddings pe
  LEFT JOIN research_papers rp ON pe.paper_id = rp.id
  WHERE 
    (problem_filter IS NULL OR rp.problem_id = problem_filter)
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS Policies for paper_embeddings
ALTER TABLE paper_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Paper embeddings are viewable by everyone"
  ON paper_embeddings FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create embeddings"
  ON paper_embeddings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for qa_history
ALTER TABLE qa_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Q&A history"
  ON qa_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Q&A entries"
  ON qa_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Q&A history"
  ON qa_history FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_logs (admin only)
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view AI logs"
  ON ai_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for paper_embeddings
CREATE TRIGGER update_paper_embeddings_updated_at
  BEFORE UPDATE ON paper_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE paper_embeddings IS 'Stores vector embeddings of research papers for semantic search';
COMMENT ON TABLE qa_history IS 'Conversation history for AI Q&A assistant';
COMMENT ON TABLE ai_logs IS 'Logs all AI API calls for monitoring and cost tracking';
COMMENT ON FUNCTION match_paper_chunks IS 'Performs semantic similarity search on paper embeddings using cosine distance';
