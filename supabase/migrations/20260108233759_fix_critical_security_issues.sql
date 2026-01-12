/*
  # Fix Critical Security and Performance Issues

  This migration addresses multiple security and performance concerns:

  ## 1. Add Missing Indexes for Foreign Keys
  - cart_items.product_id
  - contact_submissions.website_id
  - guides.category_id, product_id
  - order_items.product_id
  - user_website_registrations.website_id

  ## 2. Fix RLS Policies with Always True Conditions (CRITICAL)
  - Remove policies that bypass security with `true` conditions
  - Implement proper admin-only restrictions

  ## 3. Optimize Auth Function Calls in RLS
  - Wrap auth functions with `(select auth.function())` to prevent re-evaluation

  ## 4. Remove Duplicate/Overlapping Policies
  - Consolidate multiple permissive policies into single, clear policies

  ## 5. Fix Function Search Path
  - Set immutable search_path for admin_manage_product function
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_website_id ON public.contact_submissions(website_id);
CREATE INDEX IF NOT EXISTS idx_guides_category_id ON public.guides(category_id);
CREATE INDEX IF NOT EXISTS idx_guides_product_id ON public.guides(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_user_website_registrations_website_id ON public.user_website_registrations(website_id);

-- =====================================================
-- 2. FIX CRITICAL RLS POLICIES (Always True = Security Bypass)
-- =====================================================

-- DROP DANGEROUS POLICIES (These allow unrestricted access)

-- contact_submissions
DROP POLICY IF EXISTS "Anyone can delete contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can view contact submissions" ON public.contact_submissions;

-- products
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;

-- site_settings
DROP POLICY IF EXISTS "Anyone can delete site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can update site settings" ON public.site_settings;

-- orders & order_items
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

-- user_website_registrations
DROP POLICY IF EXISTS "Anyone can register" ON public.user_website_registrations;

-- =====================================================
-- 3. FIX AUTH FUNCTION CALLS IN RLS (Performance)
-- =====================================================

-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Contact Submissions - Admin only management
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage contact submissions"
  ON public.contact_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Blogs
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
CREATE POLICY "Admins can manage blogs"
  ON public.blogs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Guides
DROP POLICY IF EXISTS "Admins can manage guides" ON public.guides;
CREATE POLICY "Admins can manage guides"
  ON public.guides
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Payment Settings
DROP POLICY IF EXISTS "Admins can manage payment settings" ON public.payment_settings;
CREATE POLICY "Admins can manage payment settings"
  ON public.payment_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Payment Methods
DROP POLICY IF EXISTS "Admins can manage payment methods" ON public.payment_methods;
CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Site Settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- FAQs
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
CREATE POLICY "Admins can manage FAQs"
  ON public.faqs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Policies
DROP POLICY IF EXISTS "Admins can manage policies" ON public.policies;
CREATE POLICY "Admins can manage policies"
  ON public.policies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- Products - Admin only for modifications
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- =====================================================
-- 4. REMOVE DUPLICATE POLICIES & Keep Only Essential Ones
-- =====================================================

-- Blogs - Keep only published view for public
DROP POLICY IF EXISTS "Anyone can view blogs" ON public.blogs;

-- Guides - Keep only published view for public
DROP POLICY IF EXISTS "Anyone can view guides" ON public.guides;

-- FAQs - Keep only active view for public
DROP POLICY IF EXISTS "Anyone can view FAQs" ON public.faqs;

-- Policies - Keep only active view for public
DROP POLICY IF EXISTS "Anyone can view policies" ON public.policies;

-- Payment Methods - Keep only enabled view for public
DROP POLICY IF EXISTS "Anyone can view all payment methods" ON public.payment_methods;

-- Payment Settings - Keep only enabled view for public
DROP POLICY IF EXISTS "Anyone can view all payment settings" ON public.payment_settings;

-- Products - Keep only active products for public
DROP POLICY IF EXISTS "Anyone can view all products" ON public.products;

-- Categories - Keep only public view
DROP POLICY IF EXISTS "Anyone can view all categories" ON public.categories;

-- Contact Submissions - Keep only insert for public
DROP POLICY IF EXISTS "Allow contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON public.contact_submissions;

-- Create proper contact submission policy for public
CREATE POLICY "Public can submit contact forms"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATH (Security)
-- =====================================================

-- Recreate admin_manage_product with secure search_path
DROP FUNCTION IF EXISTS public.admin_manage_product(uuid, text, text, text, text, numeric, integer, text, text, text, text, boolean);

CREATE OR REPLACE FUNCTION public.admin_manage_product(
  p_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_stock integer DEFAULT NULL,
  p_sku text DEFAULT NULL,
  p_features text DEFAULT NULL,
  p_specifications text DEFAULT NULL,
  p_additional_images text DEFAULT NULL,
  p_is_active boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_email text;
  v_result json;
  v_product_id uuid;
BEGIN
  v_admin_email := current_setting('request.jwt.claims', true)::json->>'email';

  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE email = v_admin_email) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.products (
      name, description, category, image_url, price, stock,
      sku, features, specifications, additional_images, is_active
    )
    VALUES (
      p_name, p_description, p_category, p_image_url, p_price, p_stock,
      p_sku, p_features, p_specifications, p_additional_images, p_is_active
    )
    RETURNING id INTO v_product_id;

    SELECT json_build_object(
      'success', true,
      'message', 'Product created successfully',
      'product_id', v_product_id
    ) INTO v_result;
  ELSE
    UPDATE public.products
    SET
      name = COALESCE(p_name, name),
      description = COALESCE(p_description, description),
      category = COALESCE(p_category, category),
      image_url = COALESCE(p_image_url, image_url),
      price = COALESCE(p_price, price),
      stock = COALESCE(p_stock, stock),
      sku = COALESCE(p_sku, sku),
      features = COALESCE(p_features, features),
      specifications = COALESCE(p_specifications, specifications),
      additional_images = COALESCE(p_additional_images, additional_images),
      is_active = COALESCE(p_is_active, is_active),
      updated_at = now()
    WHERE id = p_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found';
    END IF;

    SELECT json_build_object(
      'success', true,
      'message', 'Product updated successfully',
      'product_id', p_id
    ) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;