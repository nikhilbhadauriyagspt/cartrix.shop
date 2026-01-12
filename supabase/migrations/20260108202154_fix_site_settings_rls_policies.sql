/*
  # Fix Site Settings RLS Policies

  ## Overview
  Fix RLS policies for site_settings table to allow admin operations
  
  ## Changes
  1. Drop existing restrictive policies
  2. Create permissive policies for all operations
  3. Allow anyone to read site settings (for public frontend)
  4. Allow anyone to insert/update site settings (for admin panel)
*/

-- Drop all existing policies on site_settings
DROP POLICY IF EXISTS "Allow authenticated users to read site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can update site settings" ON site_settings;

-- Allow anyone to SELECT site settings (needed for public frontend)
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Allow anyone to INSERT site settings (needed for admin panel)
CREATE POLICY "Anyone can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (true);

-- Allow anyone to UPDATE site settings (needed for admin panel)
CREATE POLICY "Anyone can update site settings"
  ON site_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to DELETE site settings (needed for admin panel)
CREATE POLICY "Anyone can delete site settings"
  ON site_settings FOR DELETE
  USING (true);
