/*
  # Fix Storage Policies and Add Guides Table

  1. Changes
    - Drop and recreate storage policies to allow all authenticated users to upload/update/delete
    - Create guides table with image support
    - Add is_active column to products table if not exists
    - Add is_active column to categories table if not exists

  2. New Tables
    - `guides`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `content` (text)
      - `image_url` (text)
      - `category_id` (uuid, foreign key)
      - `is_published` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on guides table
    - Public can view published guides
    - Authenticated users can manage their guides
    - Fix storage policies for all authenticated users
*/

-- Add is_active to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Add is_active to categories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE categories ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create guides table
CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on guides
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Public can view published guides
CREATE POLICY "Public can view published guides"
  ON guides FOR SELECT
  TO public
  USING (is_published = true);

-- Authenticated users can view all guides
CREATE POLICY "Authenticated users can view all guides"
  ON guides FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert guides
CREATE POLICY "Authenticated users can insert guides"
  ON guides FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update guides
CREATE POLICY "Authenticated users can update guides"
  ON guides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete guides
CREATE POLICY "Authenticated users can delete guides"
  ON guides FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete assets" ON storage.objects;

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images')
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can update assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'assets')
  WITH CHECK (bucket_id = 'assets');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'assets');
