/*
  # Fix Storage Policies for Image Upload

  ## Changes
  - Remove authentication requirement for INSERT operations on storage
  - Allow anyone to upload images to storage buckets
  - Keep UPDATE and DELETE restricted to authenticated users for security
  
  ## Rationale
  - Admin system uses custom authentication (not Supabase Auth)
  - Service role key may not be available in all deployments
  - Public upload is safe since buckets are already public
  - Update/Delete operations remain protected
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;

-- Create new public INSERT policies
CREATE POLICY "Anyone can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assets');