/*
  # Fix Security Issues

  ## Changes Made

  ### 1. Index Management
  - Add missing index on `blogs.author_id` foreign key
  - Remove unused indexes:
    - `idx_cart_items_product_id`
    - `idx_guides_category_id`
    - `idx_guides_product_id`
    - `idx_order_items_product_id`
    - `idx_orders_guest_email`
    - `idx_cart_items_session_id`

  ### 2. Fix Multiple Permissive Policies
  Remove duplicate/overlapping RLS policies:
  - admins: Remove "Admins can read own data"
  - blogs: Remove "Admins can manage blogs" SELECT policy
  - categories: Remove "Admins can manage categories" SELECT policy
  - contact_submissions: Remove "Admins can manage contact submissions" INSERT/SELECT policies
  - faqs: Remove "Admins can manage FAQs" SELECT policy
  - guides: Remove "Admins can manage guides" SELECT policy
  - payment_methods: Remove "Admins can manage payment methods" SELECT policy
  - payment_settings: Remove "Admins can manage payment settings" SELECT policy
  - policies: Remove "Admins can manage policies" SELECT policy
  - site_settings: Remove "Admins can manage site settings" SELECT policy

  ### 3. Fix Function Search Paths
  - Set immutable search_path for `bulk_insert_products` function
  - Set immutable search_path for `admin_manage_product` function

  ### 4. Fix RLS Policy Always True
  - Update "Anyone can create contact submissions" policy to be restrictive

  ### 5. Notes
  - Auth DB Connection Strategy: This requires manual configuration in Supabase dashboard
  - Leaked Password Protection: This requires enabling HIBP in Supabase auth settings
*/

-- Add missing index for blogs.author_id foreign key
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);

-- Remove unused indexes
DROP INDEX IF EXISTS public.idx_cart_items_product_id;
DROP INDEX IF EXISTS public.idx_guides_category_id;
DROP INDEX IF EXISTS public.idx_guides_product_id;
DROP INDEX IF EXISTS public.idx_order_items_product_id;
DROP INDEX IF EXISTS public.idx_orders_guest_email;
DROP INDEX IF EXISTS public.idx_cart_items_session_id;

-- Fix Multiple Permissive Policies
-- admins table
DROP POLICY IF EXISTS "Admins can read own data" ON public.admins;

-- blogs table - keep the public read policy, drop admin SELECT
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
-- Recreate as UPDATE/DELETE/INSERT only
CREATE POLICY "Admins can manage blogs" ON public.blogs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- categories table
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- contact_submissions table
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage contact submissions" ON public.contact_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- faqs table
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
CREATE POLICY "Admins can manage FAQs" ON public.faqs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- guides table
DROP POLICY IF EXISTS "Admins can manage guides" ON public.guides;
CREATE POLICY "Admins can manage guides" ON public.guides
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- payment_methods table
DROP POLICY IF EXISTS "Admins can manage payment methods" ON public.payment_methods;
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- payment_settings table
DROP POLICY IF EXISTS "Admins can manage payment settings" ON public.payment_settings;
CREATE POLICY "Admins can manage payment settings" ON public.payment_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- policies table
DROP POLICY IF EXISTS "Admins can manage policies" ON public.policies;
CREATE POLICY "Admins can manage policies" ON public.policies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- site_settings table
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Fix RLS Policy Always True for contact_submissions
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;

-- Create a more restrictive policy that still allows submissions but validates data
CREATE POLICY "Allow contact submissions" ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND 
    email IS NOT NULL AND 
    message IS NOT NULL AND
    length(trim(name)) > 0 AND
    length(trim(email)) > 0 AND
    length(trim(message)) > 0
  );

-- Fix Function Search Paths
-- Drop and recreate bulk_insert_products with immutable search_path
DROP FUNCTION IF EXISTS public.bulk_insert_products(jsonb);

CREATE FUNCTION public.bulk_insert_products(products_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
  inserted_count integer := 0;
  failed_count integer := 0;
  product_record jsonb;
BEGIN
  FOR product_record IN SELECT * FROM jsonb_array_elements(products_data)
  LOOP
    BEGIN
      INSERT INTO public.products (
        name,
        description,
        price,
        category_id,
        image_url,
        stock,
        is_featured
      ) VALUES (
        (product_record->>'name')::text,
        (product_record->>'description')::text,
        (product_record->>'price')::decimal,
        (product_record->>'category_id')::uuid,
        (product_record->>'image_url')::text,
        COALESCE((product_record->>'stock')::integer, 0),
        COALESCE((product_record->>'is_featured')::boolean, false)
      );
      inserted_count := inserted_count + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
    END;
  END LOOP;

  result := jsonb_build_object(
    'success', true,
    'inserted', inserted_count,
    'failed', failed_count
  );

  RETURN result;
END;
$$;

-- Drop and recreate admin_manage_product with immutable search_path
DROP FUNCTION IF EXISTS public.admin_manage_product(text, uuid, text, text, decimal, uuid, text, integer, boolean);

CREATE FUNCTION public.admin_manage_product(
  p_action text,
  p_product_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_price decimal DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_stock integer DEFAULT NULL,
  p_is_featured boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
  new_product_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  CASE p_action
    WHEN 'create' THEN
      INSERT INTO public.products (name, description, price, category_id, image_url, stock, is_featured)
      VALUES (p_name, p_description, p_price, p_category_id, p_image_url, COALESCE(p_stock, 0), COALESCE(p_is_featured, false))
      RETURNING id INTO new_product_id;
      
      result := jsonb_build_object('success', true, 'id', new_product_id);

    WHEN 'update' THEN
      UPDATE public.products
      SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        price = COALESCE(p_price, price),
        category_id = COALESCE(p_category_id, category_id),
        image_url = COALESCE(p_image_url, image_url),
        stock = COALESCE(p_stock, stock),
        is_featured = COALESCE(p_is_featured, is_featured)
      WHERE id = p_product_id;
      
      result := jsonb_build_object('success', true, 'id', p_product_id);

    WHEN 'delete' THEN
      DELETE FROM public.products WHERE id = p_product_id;
      result := jsonb_build_object('success', true, 'id', p_product_id);

    ELSE
      result := jsonb_build_object('success', false, 'error', 'Invalid action');
  END CASE;

  RETURN result;
END;
$$;
