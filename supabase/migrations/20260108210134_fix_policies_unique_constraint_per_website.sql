/*
  # Fix Policies Unique Constraint for Multi-Website Support

  ## Overview
  Update the unique constraint on policies table to allow the same slug across different websites
  while preventing duplicate slugs within the same website.

  ## Changes
  1. Drop the existing unique constraint on slug column
  2. Create a composite unique constraint on (website_id, slug)
  3. This allows:
     - Website 1 can have slug "privacy-policy"
     - Website 2 can also have slug "privacy-policy"
     - But Website 1 cannot have two policies with slug "privacy-policy"

  ## Why This Change
  - Supports multi-website functionality properly
  - Each website can have its own set of standard policy pages
  - Prevents confusion and allows independent policy management per website
*/

-- Drop the old unique constraint on slug only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'policies_slug_key'
  ) THEN
    ALTER TABLE policies DROP CONSTRAINT policies_slug_key;
  END IF;
END $$;

-- Create a composite unique constraint on (website_id, slug)
-- This ensures slug is unique per website, not globally
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'policies_website_slug_unique'
  ) THEN
    ALTER TABLE policies ADD CONSTRAINT policies_website_slug_unique UNIQUE (website_id, slug);
  END IF;
END $$;
