/*
  # Fix Contact Submissions RLS Policies

  ## Overview
  Fix RLS policies for contact_submissions to allow:
  - Anyone can insert submissions
  - Anyone can view submissions (for admin access)

  ## Changes
  1. Drop existing policies
  2. Create new policies for insert and select
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Anyone can view contact submissions" ON contact_submissions;

-- Allow anyone to insert contact submissions
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view contact submissions (needed for admin panel)
CREATE POLICY "Anyone can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (true);

-- Allow updates to status (for admin)
CREATE POLICY "Anyone can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow deletes (for admin)
CREATE POLICY "Anyone can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (true);
