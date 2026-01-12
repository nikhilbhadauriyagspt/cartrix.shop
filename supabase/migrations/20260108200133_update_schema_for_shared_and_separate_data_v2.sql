/*
  # Update Schema for Shared and Separate Data

  ## Overview
  Reorganize data structure to support multi-website with proper sharing:
  
  ## Shared Across All Websites:
  - Products (already done)
  - Categories
  - Payment Settings

  ## Website-Specific:
  - FAQs
  - Policies
  - Brand Settings (site_settings)
  - Orders
  - Contact Submissions
  - User registrations (track which website user came from)

  ## Changes
  1. Update categories RLS to allow viewing all categories
  2. Update payment settings RLS to be shared
  3. Add website_id to contact_submissions
  4. Add user_website_registrations table
*/

-- 1. Categories: Make them shared (remove website_id requirement)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view all categories"
  ON categories FOR SELECT
  USING (true);

-- 2. Payment Settings: Make them shared
DROP POLICY IF EXISTS "Anyone can view payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Anyone can view payment methods" ON payment_methods;

CREATE POLICY "Anyone can view all payment settings"
  ON payment_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view all payment methods"
  ON payment_methods FOR SELECT
  USING (true);

-- 3. Contact Submissions: Make them website-specific
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions' AND column_name = 'website_id'
  ) THEN
    ALTER TABLE contact_submissions ADD COLUMN website_id uuid REFERENCES websites(id) DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
END $$;

-- Update contact submissions RLS
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- 4. Track user registrations by website
CREATE TABLE IF NOT EXISTS user_website_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  website_id uuid REFERENCES websites(id) NOT NULL,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(user_id, website_id)
);

ALTER TABLE user_website_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user registrations"
  ON user_website_registrations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can register"
  ON user_website_registrations FOR INSERT
  WITH CHECK (true);
