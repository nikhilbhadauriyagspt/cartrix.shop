-- Update user_website_registrations RLS policy for security
-- This migration updates the RLS policy for the user_website_registrations table.
-- The previous policy was too permissive. The new policy ensures that a user can only
-- insert a registration entry for their own user_id, which is more secure and
-- resolves potential issues during the signup flow.

-- Drop the old, permissive policy
DROP POLICY IF EXISTS "Anyone can register" ON public.user_website_registrations;

-- Create a new, more secure policy
CREATE POLICY "Users can add their own registration"
  ON public.user_website_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
