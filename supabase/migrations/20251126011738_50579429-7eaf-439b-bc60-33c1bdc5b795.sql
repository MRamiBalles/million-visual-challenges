-- Agregar campos para compartir experimentos públicamente
ALTER TABLE public.experiments 
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Crear índice para búsqueda rápida por token
CREATE INDEX idx_experiments_share_token ON public.experiments(share_token) WHERE share_token IS NOT NULL;

-- Crear índice para experimentos públicos
CREATE INDEX idx_experiments_public ON public.experiments(is_public, created_at DESC) WHERE is_public = TRUE;

-- Tabla para rastrear tiempo dedicado a visualizaciones
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_slug TEXT NOT NULL,
  visualization_type TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS en user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_activity
CREATE POLICY "Users can view their own activity" 
ON public.user_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id, session_date DESC);
CREATE INDEX idx_user_activity_problem ON public.user_activity(user_id, problem_slug);

-- Tabla para likes de experimentos
CREATE TABLE public.experiment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, user_id)
);

-- Enable RLS en experiment_likes
ALTER TABLE public.experiment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para experiment_likes
CREATE POLICY "Anyone can view likes" 
ON public.experiment_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like experiments" 
ON public.experiment_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike experiments" 
ON public.experiment_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para likes
CREATE INDEX idx_experiment_likes_experiment ON public.experiment_likes(experiment_id);
CREATE INDEX idx_experiment_likes_user ON public.experiment_likes(user_id);

-- Política para ver experimentos públicos
CREATE POLICY "Public experiments are viewable by everyone" 
ON public.experiments 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Función para generar token de compartir único
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    token := encode(gen_random_bytes(12), 'base64');
    token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');
    
    SELECT EXISTS(SELECT 1 FROM public.experiments WHERE share_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$;

-- Trigger para actualizar likes_count cuando se agrega/elimina un like
CREATE OR REPLACE FUNCTION update_experiment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experiments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.experiment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.experiments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.experiment_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER experiment_likes_count_trigger
AFTER INSERT OR DELETE ON public.experiment_likes
FOR EACH ROW
EXECUTE FUNCTION update_experiment_likes_count();