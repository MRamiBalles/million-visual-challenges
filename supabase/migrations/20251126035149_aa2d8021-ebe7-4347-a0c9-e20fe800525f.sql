-- Create millennium_problems table
CREATE TABLE IF NOT EXISTS public.millennium_problems (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  field TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2000,
  status TEXT NOT NULL DEFAULT 'unsolved' CHECK (status IN ('solved', 'unsolved')),
  solver TEXT DEFAULT '',
  solver_year INTEGER DEFAULT 0,
  prize TEXT DEFAULT '$1,000,000',
  description_simple TEXT NOT NULL,
  description_intermediate TEXT NOT NULL,
  description_advanced TEXT NOT NULL,
  clay_paper_author TEXT NOT NULL,
  clay_paper_year INTEGER NOT NULL,
  clay_paper_url TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research_papers table
CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id INTEGER REFERENCES public.millennium_problems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  abstract TEXT,
  arxiv_id TEXT UNIQUE,
  pdf_url TEXT,
  published_date DATE,
  citation_count INTEGER DEFAULT 0,
  relevance_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS millennium_problems_slug_idx ON public.millennium_problems(slug);
CREATE INDEX IF NOT EXISTS research_papers_problem_id_idx ON public.research_papers(problem_id);
CREATE INDEX IF NOT EXISTS research_papers_arxiv_id_idx ON public.research_papers(arxiv_id);
CREATE INDEX IF NOT EXISTS research_papers_published_date_idx ON public.research_papers(published_date DESC);

-- RLS Policies for millennium_problems (public read, admin write)
ALTER TABLE public.millennium_problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view millennium problems"
  ON public.millennium_problems FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert millennium problems"
  ON public.millennium_problems FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update millennium problems"
  ON public.millennium_problems FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete millennium problems"
  ON public.millennium_problems FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for research_papers (public read, authenticated write)
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view research papers"
  ON public.research_papers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert research papers"
  ON public.research_papers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update research papers"
  ON public.research_papers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete research papers"
  ON public.research_papers FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_millennium_problems_updated_at
  BEFORE UPDATE ON public.millennium_problems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_papers_updated_at
  BEFORE UPDATE ON public.research_papers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 7 Millennium Prize Problems
INSERT INTO public.millennium_problems (slug, title, short_title, field, year, status, solver, solver_year, description_simple, description_intermediate, description_advanced, clay_paper_author, clay_paper_year, clay_paper_url) VALUES
('pvsnp', 'P vs NP Problem', 'P vs NP', 'Computer Science', 2000, 'unsolved', '', 0, 
 'Can every problem whose solution can be quickly verified also be quickly solved?',
 'The P vs NP problem asks whether every problem for which a solution can be verified in polynomial time can also be solved in polynomial time.',
 'The problem asks whether P = NP, where P is the class of problems solvable in polynomial time and NP is the class of problems for which solutions can be verified in polynomial time.',
 'Stephen Cook', 2000, 'https://www.claymath.org/millennium-problems/p-vs-np-problem'),

('riemann', 'Riemann Hypothesis', 'Riemann', 'Mathematics', 2000, 'unsolved', '', 0,
 'All non-trivial zeros of the Riemann zeta function have real part equal to 1/2.',
 'The Riemann Hypothesis concerns the distribution of prime numbers and states that all non-trivial zeros of the zeta function lie on the critical line.',
 'The hypothesis states that all non-trivial zeros of the Riemann zeta function ζ(s) have real part Re(s) = 1/2, which has profound implications for the distribution of prime numbers.',
 'Enrico Bombieri', 2000, 'https://www.claymath.org/millennium-problems/riemann-hypothesis'),

('navier-stokes', 'Navier-Stokes Existence and Smoothness', 'Navier-Stokes', 'Mathematics', 2000, 'unsolved', '', 0,
 'Do smooth solutions always exist for the Navier-Stokes equations in three dimensions?',
 'The problem asks whether smooth, globally defined solutions to the Navier-Stokes equations always exist for three-dimensional fluid flow.',
 'Prove or give a counter-example of the following statement: In three space dimensions and time, given an initial velocity field, there exists a vector velocity and a scalar pressure field, which are both smooth and globally defined, that solve the Navier-Stokes equations.',
 'Charles Fefferman', 2000, 'https://www.claymath.org/millennium-problems/navier-stokes-equation'),

('yang-mills', 'Yang-Mills Existence and Mass Gap', 'Yang-Mills', 'Physics', 2000, 'unsolved', '', 0,
 'Prove that Yang-Mills theory exists and has a mass gap.',
 'The problem requires proving the existence of Yang-Mills theory in a mathematically rigorous way and showing that it predicts a mass gap.',
 'Prove that for any compact simple gauge group G, a non-trivial quantum Yang-Mills theory exists on ℝ⁴ and has a mass gap Δ > 0.',
 'Arthur Jaffe & Edward Witten', 2000, 'https://www.claymath.org/millennium-problems/yang-mills-and-mass-gap'),

('hodge', 'Hodge Conjecture', 'Hodge', 'Mathematics', 2000, 'unsolved', '', 0,
 'On a projective algebraic variety, any Hodge class is a combination of classes of algebraic cycles.',
 'The Hodge Conjecture relates the algebraic topology of a smooth complex algebraic variety to its algebraic geometry.',
 'The conjecture states that for a non-singular complex projective manifold X, every Hodge class on X is a rational linear combination of classes of algebraic cycles.',
 'Pierre Deligne', 2000, 'https://www.claymath.org/millennium-problems/hodge-conjecture'),

('birch-sd', 'Birch and Swinnerton-Dyer Conjecture', 'Birch-SD', 'Mathematics', 2000, 'unsolved', '', 0,
 'The rank of an elliptic curve equals the order of vanishing of its L-function at s=1.',
 'The conjecture relates the number of rational points on an elliptic curve to the behavior of its L-function.',
 'The conjecture states that the rank of the group of rational points on an elliptic curve equals the order of the zero of the associated L-series L(E,s) at s=1.',
 'Andrew Wiles', 2000, 'https://www.claymath.org/millennium-problems/birch-and-swinnerton-dyer-conjecture'),

('poincare', 'Poincaré Conjecture', 'Poincaré', 'Mathematics', 2000, 'solved', 'Grigori Perelman', 2003,
 'Every simply connected, closed 3-manifold is homeomorphic to the 3-sphere.',
 'The conjecture states that if a three-dimensional space has certain properties, it must be a three-dimensional sphere.',
 'Every simply connected, closed 3-manifold is homeomorphic to the 3-sphere. This was proven by Grigori Perelman using Ricci flow.',
 'John Milnor', 2000, 'https://www.claymath.org/millennium-problems/poincare-conjecture');

-- Comments for documentation
COMMENT ON TABLE public.millennium_problems IS 'Stores the 7 Millennium Prize Problems with descriptions and status';
COMMENT ON TABLE public.research_papers IS 'Academic papers related to Millennium Problems for AI-powered research assistance';