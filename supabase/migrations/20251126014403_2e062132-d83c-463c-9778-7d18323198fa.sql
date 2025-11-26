-- Add length constraints for profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_length CHECK (char_length(username) <= 50),
ADD CONSTRAINT profiles_display_name_length CHECK (char_length(display_name) <= 100),
ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 500),
ADD CONSTRAINT profiles_website_url_length CHECK (char_length(website_url) <= 255),
ADD CONSTRAINT profiles_twitter_handle_length CHECK (char_length(twitter_handle) <= 20),
ADD CONSTRAINT profiles_github_handle_length CHECK (char_length(github_handle) <= 39);

-- Add length constraints for experiment_comments table
ALTER TABLE public.experiment_comments
ADD CONSTRAINT experiment_comments_text_length CHECK (char_length(comment_text) >= 1 AND char_length(comment_text) <= 2000);

-- Add length constraints for experiments table
ALTER TABLE public.experiments
ADD CONSTRAINT experiments_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
ADD CONSTRAINT experiments_description_length CHECK (char_length(description) <= 1000);

-- Add length constraints for collections table
ALTER TABLE public.collections
ADD CONSTRAINT collections_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
ADD CONSTRAINT collections_description_length CHECK (char_length(description) <= 500);