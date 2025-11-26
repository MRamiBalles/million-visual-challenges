-- Security Fix: Restrict public access to user_roles table
-- Issue: user_roles table has a public SELECT policy (USING: true) that allows 
-- anyone to enumerate which users have admin/moderator privileges

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;

-- Create restrictive policy: users can only view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Keep the existing INSERT policy for admins (using has_role function)
-- Already exists: "Admins can create user roles"