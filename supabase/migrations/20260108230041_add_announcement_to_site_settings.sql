/*
  # Add Announcement Bar Settings

  1. Changes
    - Add `announcement_text` column to site_settings table
    - Add `announcement_enabled` column to site_settings table
  
  2. Details
    - `announcement_text`: Stores the announcement message (nullable)
    - `announcement_enabled`: Boolean to enable/disable announcement bar (default: false)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'announcement_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN announcement_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'announcement_enabled'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN announcement_enabled boolean DEFAULT false;
  END IF;
END $$;
