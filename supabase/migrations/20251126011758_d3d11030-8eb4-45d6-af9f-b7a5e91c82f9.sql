-- Arreglar funciones con search_path mutable

-- Función para generar token de compartir único (con search_path)
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Trigger para actualizar likes_count (con search_path)
CREATE OR REPLACE FUNCTION update_experiment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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