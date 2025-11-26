-- Remove the unrestricted INSERT policy that allows anyone to spam notifications
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;

-- Add DELETE policy so users can manage their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);