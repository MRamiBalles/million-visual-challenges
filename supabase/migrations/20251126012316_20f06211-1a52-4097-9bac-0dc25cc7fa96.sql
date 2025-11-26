-- Create badges table
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE,
  from_user_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view user badges"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value) VALUES
  ('Principiante Curioso', 'Explora tu primer problema matemático', '🌟', 'problems_explored', 1),
  ('Explorador Activo', 'Explora 3 problemas diferentes', '🔍', 'problems_explored', 3),
  ('Maestro del Milenio', 'Explora todos los problemas del milenio', '👑', 'problems_explored', 7),
  ('Primera Hora', 'Dedica 1 hora a las visualizaciones', '⏰', 'time_spent', 3600),
  ('Maratonista', 'Dedica 5 horas a las visualizaciones', '🏃', 'time_spent', 18000),
  ('Compartidor', 'Comparte tu primer experimento', '🎁', 'experiments_shared', 1),
  ('Influencer', 'Comparte 5 experimentos', '✨', 'experiments_shared', 5),
  ('Estrella', 'Comparte 10 experimentos', '⭐', 'experiments_shared', 10),
  ('Popular', 'Recibe 10 likes en tus experimentos', '❤️', 'likes_received', 10),
  ('Celebridad', 'Recibe 50 likes en tus experimentos', '🌟', 'likes_received', 50);

-- Create trigger to send notification when someone likes an experiment
CREATE OR REPLACE FUNCTION public.notify_experiment_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  experiment_owner_id uuid;
  experiment_title text;
BEGIN
  SELECT user_id, title INTO experiment_owner_id, experiment_title
  FROM public.experiments
  WHERE id = NEW.experiment_id;
  
  IF experiment_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, experiment_id, from_user_id)
    VALUES (
      experiment_owner_id,
      'like',
      'Nuevo like en tu experimento',
      'Alguien dio like a "' || experiment_title || '"',
      NEW.experiment_id,
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_experiment_like
  AFTER INSERT ON public.experiment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_experiment_like();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;