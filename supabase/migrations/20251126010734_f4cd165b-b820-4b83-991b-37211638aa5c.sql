-- Tabla para guardar experimentos de los problemas del milenio
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_slug TEXT NOT NULL,
  experiment_type TEXT NOT NULL,
  experiment_data JSONB NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para experimentos
CREATE POLICY "Users can view their own experiments" 
ON public.experiments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiments" 
ON public.experiments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments" 
ON public.experiments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments" 
ON public.experiments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_experiments_updated_at
BEFORE UPDATE ON public.experiments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar el rendimiento
CREATE INDEX idx_experiments_user_id ON public.experiments(user_id);
CREATE INDEX idx_experiments_problem_slug ON public.experiments(problem_slug);
CREATE INDEX idx_experiments_created_at ON public.experiments(created_at DESC);