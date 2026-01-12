/*
  # Fix Guides and Blogs Unique Constraints for Multi-Website Support

  ## Overview
  Update the unique constraints on guides and blogs tables to allow the same slug across 
  different websites while preventing duplicate slugs within the same website.

  ## Changes
  1. Drop the existing unique constraint on guides.slug
  2. Create a composite unique constraint on guides(website_id, slug)
  3. Drop the existing unique constraint on blogs.slug
  4. Create a composite unique constraint on blogs(website_id, slug)

  ## Benefits
  - Each website can have its own guides with standard slugs like "getting-started"
  - Each website can have its own blogs with common slugs
  - Prevents duplicate slugs within the same website
  - Supports true multi-website functionality
*/

-- Fix Guides table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'guides_slug_key'
  ) THEN
    ALTER TABLE guides DROP CONSTRAINT guides_slug_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'guides_website_slug_unique'
  ) THEN
    ALTER TABLE guides ADD CONSTRAINT guides_website_slug_unique UNIQUE (website_id, slug);
  END IF;
END $$;

-- Fix Blogs table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blogs_slug_key'
  ) THEN
    ALTER TABLE blogs DROP CONSTRAINT blogs_slug_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blogs_website_slug_unique'
  ) THEN
    ALTER TABLE blogs ADD CONSTRAINT blogs_website_slug_unique UNIQUE (website_id, slug);
  END IF;
END $$;
