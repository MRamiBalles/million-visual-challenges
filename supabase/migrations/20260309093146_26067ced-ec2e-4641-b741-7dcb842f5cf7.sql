DROP POLICY IF EXISTS "Only authenticated users can create embeddings" ON paper_embeddings;

CREATE POLICY "Only service role can insert embeddings"
  ON paper_embeddings FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');