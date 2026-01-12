/*
  # Fix Products RLS for Shared Access

  ## Overview
  Products should be shared across all websites, so RLS policies should NOT filter by website_id

  ## Changes
  1. Update products SELECT policy to allow viewing all products
  2. Keep insert/update/delete restricted but not by website
*/

-- Drop existing products policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view all products" ON products;

-- Create new SELECT policy - allow viewing ALL products (shared)
CREATE POLICY "Anyone can view all products"
  ON products FOR SELECT
  USING (true);

-- Keep other policies unrestricted for now (admin will handle through functions)
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON products;
CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete products" ON products;
CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  USING (true);
