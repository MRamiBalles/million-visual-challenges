CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'user',
    'moderator',
    'admin'
);


--
-- Name: cleanup_old_rate_limits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_rate_limits() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < now() - interval '1 hour';
END;
$$;


--
-- Name: generate_share_token(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_share_token() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text from 1 for 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario')
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: notify_experiment_like(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_experiment_like() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: update_experiment_likes_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_experiment_likes_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    criteria_type text NOT NULL,
    criteria_value integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: collection_experiments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collection_experiments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id uuid NOT NULL,
    experiment_id uuid NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT collections_description_length CHECK ((char_length(description) <= 500)),
    CONSTRAINT collections_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100)))
);


--
-- Name: experiment_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiment_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    experiment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT experiment_comments_text_length CHECK (((char_length(comment_text) >= 1) AND (char_length(comment_text) <= 2000)))
);


--
-- Name: experiment_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiment_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    experiment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: experiments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    problem_slug text NOT NULL,
    experiment_type text NOT NULL,
    experiment_data jsonb NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_public boolean DEFAULT false,
    share_token text,
    view_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    CONSTRAINT experiments_description_length CHECK ((char_length(description) <= 1000)),
    CONSTRAINT experiments_title_length CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200)))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    experiment_id uuid,
    from_user_id uuid,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    username text,
    display_name text,
    bio text,
    avatar_url text,
    website_url text,
    twitter_handle text,
    github_handle text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_bio_length CHECK ((char_length(bio) <= 500)),
    CONSTRAINT profiles_display_name_length CHECK ((char_length(display_name) <= 100)),
    CONSTRAINT profiles_github_handle_length CHECK ((char_length(github_handle) <= 39)),
    CONSTRAINT profiles_twitter_handle_length CHECK ((char_length(twitter_handle) <= 20)),
    CONSTRAINT profiles_username_length CHECK ((char_length(username) <= 50)),
    CONSTRAINT profiles_website_url_length CHECK ((char_length(website_url) <= 255))
);


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    action_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    problem_slug text NOT NULL,
    visualization_type text NOT NULL,
    duration_seconds integer NOT NULL,
    session_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: collection_experiments collection_experiments_collection_id_experiment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_experiments
    ADD CONSTRAINT collection_experiments_collection_id_experiment_id_key UNIQUE (collection_id, experiment_id);


--
-- Name: collection_experiments collection_experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_experiments
    ADD CONSTRAINT collection_experiments_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: experiment_comments experiment_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_comments
    ADD CONSTRAINT experiment_comments_pkey PRIMARY KEY (id);


--
-- Name: experiment_likes experiment_likes_experiment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_likes
    ADD CONSTRAINT experiment_likes_experiment_id_user_id_key UNIQUE (experiment_id, user_id);


--
-- Name: experiment_likes experiment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_likes
    ADD CONSTRAINT experiment_likes_pkey PRIMARY KEY (id);


--
-- Name: experiments experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_pkey PRIMARY KEY (id);


--
-- Name: experiments experiments_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_share_token_key UNIQUE (share_token);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (id);


--
-- Name: user_activity user_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity
    ADD CONSTRAINT user_activity_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_experiment_likes_experiment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiment_likes_experiment ON public.experiment_likes USING btree (experiment_id);


--
-- Name: idx_experiment_likes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiment_likes_user ON public.experiment_likes USING btree (user_id);


--
-- Name: idx_experiments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiments_created_at ON public.experiments USING btree (created_at DESC);


--
-- Name: idx_experiments_problem_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiments_problem_slug ON public.experiments USING btree (problem_slug);


--
-- Name: idx_experiments_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiments_public ON public.experiments USING btree (is_public, created_at DESC) WHERE (is_public = true);


--
-- Name: idx_experiments_share_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiments_share_token ON public.experiments USING btree (share_token) WHERE (share_token IS NOT NULL);


--
-- Name: idx_experiments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_experiments_user_id ON public.experiments USING btree (user_id);


--
-- Name: idx_rate_limits_user_action_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limits_user_action_time ON public.rate_limits USING btree (user_id, action_type, created_at DESC);


--
-- Name: idx_user_activity_problem; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_problem ON public.user_activity USING btree (user_id, problem_slug);


--
-- Name: idx_user_activity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_user_id ON public.user_activity USING btree (user_id, session_date DESC);


--
-- Name: experiment_likes experiment_likes_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER experiment_likes_count_trigger AFTER INSERT OR DELETE ON public.experiment_likes FOR EACH ROW EXECUTE FUNCTION public.update_experiment_likes_count();


--
-- Name: experiment_likes on_experiment_like; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_experiment_like AFTER INSERT ON public.experiment_likes FOR EACH ROW EXECUTE FUNCTION public.notify_experiment_like();


--
-- Name: collections update_collections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: experiment_comments update_experiment_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_experiment_comments_updated_at BEFORE UPDATE ON public.experiment_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: experiments update_experiments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: collection_experiments collection_experiments_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_experiments
    ADD CONSTRAINT collection_experiments_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;


--
-- Name: collection_experiments collection_experiments_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_experiments
    ADD CONSTRAINT collection_experiments_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: experiment_comments experiment_comments_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_comments
    ADD CONSTRAINT experiment_comments_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: experiment_likes experiment_likes_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_likes
    ADD CONSTRAINT experiment_likes_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'admin'::public.app_role)))));


--
-- Name: rate_limits Admins can view all rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all rate limits" ON public.rate_limits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: badges Anyone can view badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);


--
-- Name: experiment_likes Anyone can view likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view likes" ON public.experiment_likes FOR SELECT USING (true);


--
-- Name: collection_experiments Anyone can view public collection experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public collection experiments" ON public.collection_experiments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_experiments.collection_id) AND ((collections.is_public = true) OR (collections.user_id = auth.uid()))))));


--
-- Name: user_badges Anyone can view user badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);


--
-- Name: user_roles Anyone can view user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view user roles" ON public.user_roles FOR SELECT TO authenticated USING (true);


--
-- Name: experiment_comments Comments are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Comments are viewable by everyone" ON public.experiment_comments FOR SELECT USING (true);


--
-- Name: profiles Profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: collections Public collections are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public collections are viewable by everyone" ON public.collections FOR SELECT USING (((is_public = true) OR (auth.uid() = user_id)));


--
-- Name: experiments Public experiments are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public experiments are viewable by everyone" ON public.experiments FOR SELECT USING (((is_public = true) OR (auth.uid() = user_id)));


--
-- Name: collection_experiments Users can add experiments to their collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add experiments to their collections" ON public.collection_experiments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_experiments.collection_id) AND (collections.user_id = auth.uid())))));


--
-- Name: experiment_comments Users can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create comments" ON public.experiment_comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: collections Users can create their own collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own collections" ON public.collections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: experiments Users can create their own experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own experiments" ON public.experiments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: collections Users can delete their own collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own collections" ON public.collections FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: experiment_comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.experiment_comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: experiments Users can delete their own experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own experiments" ON public.experiments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can delete their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_activity Users can insert their own activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own activity" ON public.user_activity FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_badges Users can insert their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: rate_limits Users can insert their own rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own rate limits" ON public.rate_limits FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: experiment_likes Users can like experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can like experiments" ON public.experiment_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: collection_experiments Users can remove experiments from their collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove experiments from their collections" ON public.collection_experiments FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_experiments.collection_id) AND (collections.user_id = auth.uid())))));


--
-- Name: experiment_likes Users can unlike experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unlike experiments" ON public.experiment_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: collections Users can update their own collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own collections" ON public.collections FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: experiment_comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.experiment_comments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: experiments Users can update their own experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own experiments" ON public.experiments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_activity Users can view their own activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own activity" ON public.user_activity FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: experiments Users can view their own experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own experiments" ON public.experiments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: rate_limits Users can view their own rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own rate limits" ON public.rate_limits FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

--
-- Name: collection_experiments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collection_experiments ENABLE ROW LEVEL SECURITY;

--
-- Name: collections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

--
-- Name: experiment_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.experiment_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: experiment_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.experiment_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: experiments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_activity; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


