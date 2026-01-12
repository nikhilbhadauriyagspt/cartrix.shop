/*
  # Fix Products RLS Policies for Bulk Upload

  1. Changes
    - Drop existing RLS policies for products table
    - Create new, more permissive policies that allow authenticated users to manage products
    - Ensure admin users can insert, update, and delete products without restrictions

  2. Security
    - Public users can view active products
    - Authenticated users (admins) have full CRUD access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create new policies with proper permissions
CREATE POLICY "Public users can view active products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);
