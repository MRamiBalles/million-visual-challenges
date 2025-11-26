-- Sprint 3: Seed achievements data

INSERT INTO achievements (slug, name, description, icon, category, points, criteria) VALUES
  ('first_visit', 'First Steps', 'Visit your first Millennium Problem', '🚀', 'learning', 5, 
   '{"type": "visit_count", "threshold": 1}'::jsonb),
  
  ('explorer', 'Explorer', 'Visit all 7 Millennium Problems', '🗺️', 'learning', 25,
   '{"type": "unique_problems_visited", "threshold": 7}'::jsonb),
  
  ('bookworm', 'Bookworm', 'Bookmark 5 different problems', '📚', 'progress', 10,
   '{"type": "bookmarks_count", "threshold": 5}'::jsonb),
  
  ('scholar', 'Scholar', 'Spend 1 hour total studying', '⏰', 'progress', 15,
   '{"type": "total_time_seconds", "threshold": 3600}'::jsonb),
  
  ('dedicated', 'Dedicated Learner', 'Study for 7 consecutive days', '🔥', 'progress', 30,
   '{"type": "streak_days", "threshold": 7}'::jsonb),
  
  ('advanced_learner', 'Advanced Learner', 'View advanced level explanations on 3 problems', '🎓', 'learning', 20,
   '{"type": "advanced_views", "threshold": 3}'::jsonb),
  
  ('visual_master', 'Visual Master', 'Interact with 10 different visualizations', '🎨', 'learning', 25,
   '{"type": "visualizations_used", "threshold": 10}'::jsonb),
  
  ('completionist', 'Completionist', 'Complete all problems at all difficulty levels', '💯', 'progress', 50,
   '{"type": "all_levels_all_problems", "threshold": 21}'::jsonb),
  
  ('early_adopter', 'Early Adopter', 'Join during the first month', '⭐', 'community', 15,
   '{"type": "signup_before_date", "threshold": "2025-12-31"}'::jsonb),
  
  ('reference_reader', 'Reference Reader', 'View 10 different research papers', '📄', 'research', 20,
   '{"type": "papers_viewed", "threshold": 10}'::jsonb)

ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE achievements IS 'Predefined achievements that users can unlock';
