/*
  # Create Storage Buckets for Images

  1. New Storage Buckets
    - `product-images` - For product photos
    - `blog-images` - For blog post images
    - `assets` - For general assets like banners, icons, etc.

  2. Security
    - Public read access for all buckets
    - Authenticated users can upload to any bucket
    - Only admins can delete images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true),
  ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view assets" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete assets" ON storage.objects;
END $$;

-- Allow public read access to all images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Public can view blog images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

CREATE POLICY "Public can view assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'assets');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assets');

-- Only admins can update images
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt()->>'role' = 'admin')
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt()->>'role' = 'admin')
  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'assets' AND auth.jwt()->>'role' = 'admin')
  WITH CHECK (bucket_id = 'assets' AND auth.jwt()->>'role' = 'admin');

-- Only admins can delete images
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'assets' AND auth.jwt()->>'role' = 'admin');
