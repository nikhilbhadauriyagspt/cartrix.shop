/*
  # Fix Security Issues
  
  This migration addresses multiple security and performance issues:
  
  1. **Performance Optimizations**
     - Add indexes for foreign keys on cart_items, guides, and order_items
     - Remove unused indexes on blogs and user_roles
     - Optimize RLS policies by using (select auth.uid()) pattern
  
  2. **Security Enhancements**
     - Fix overly permissive RLS policies that allow unrestricted access
     - Replace "always true" policies with proper admin role checks
     - Consolidate multiple permissive policies into single restrictive policies
     - Set secure search_path for admin functions
  
  3. **RLS Policy Improvements**
     - Cart items: Optimize auth checks for better performance
     - Orders: Optimize auth checks for better performance
     - Order items: Optimize auth checks for better performance
     - Admin tables: Restrict access to verified admins only
     - Content tables: Properly restrict write operations to admins
*/

-- =====================================================
-- 1. Add Missing Indexes for Foreign Keys
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_guides_category_id ON guides(category_id);
CREATE INDEX IF NOT EXISTS idx_guides_product_id ON guides(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 2. Drop Unused Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_blogs_author;
DROP INDEX IF EXISTS idx_user_roles_role;

-- =====================================================
-- 3. Set Secure Search Path for Admin Functions
-- =====================================================

ALTER FUNCTION admin_upsert_site_settings SET search_path = public, pg_temp;
ALTER FUNCTION admin_manage_faq SET search_path = public, pg_temp;
ALTER FUNCTION admin_manage_policy SET search_path = public, pg_temp;
ALTER FUNCTION admin_manage_category SET search_path = public, pg_temp;
ALTER FUNCTION verify_admin_password SET search_path = public, pg_temp;
ALTER FUNCTION update_admin_last_login SET search_path = public, pg_temp;
ALTER FUNCTION update_admin_password SET search_path = public, pg_temp;
ALTER FUNCTION get_user_count SET search_path = public, pg_temp;
ALTER FUNCTION get_all_users SET search_path = public, pg_temp;

-- =====================================================
-- 4. Create Helper Function to Check Admin Status
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE id = (SELECT auth.uid())
  );
$$;

-- =====================================================
-- 5. Fix Cart Items RLS Policies (Optimize Auth Checks)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- 6. Fix Orders RLS Policies (Optimize Auth Checks)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 7. Fix Order Items RLS Policies (Optimize Auth Checks)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items for own orders" ON order_items;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 8. Fix User Roles RLS Policy (Optimize Auth Check)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- 9. Fix Admins Table RLS Policies (Restrict to Admins)
-- =====================================================

DROP POLICY IF EXISTS "Admins can update own data" ON admins;
DROP POLICY IF EXISTS "Admins can view own data" ON admins;

CREATE POLICY "Admins can view own data"
  ON admins FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- 10. Fix Blogs RLS Policies (Consolidate and Restrict)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view all blogs" ON blogs;
DROP POLICY IF EXISTS "Published blogs are publicly readable" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON blogs;

CREATE POLICY "Anyone can view published blogs"
  ON blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage blogs"
  ON blogs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 11. Fix Categories RLS Policies (Restrict to Admins)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 12. Fix Contact Submissions RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete contact submissions" ON contact_submissions;

CREATE POLICY "Admins can manage contact submissions"
  ON contact_submissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 13. Fix FAQs RLS Policies (Consolidate and Restrict)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can view all FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can insert FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can update FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can delete FAQs" ON faqs;

CREATE POLICY "Anyone can view active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 14. Fix Guides RLS Policies (Consolidate and Restrict)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view all guides" ON guides;
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
DROP POLICY IF EXISTS "Authenticated users can insert guides" ON guides;
DROP POLICY IF EXISTS "Authenticated users can update guides" ON guides;
DROP POLICY IF EXISTS "Authenticated users can delete guides" ON guides;

CREATE POLICY "Anyone can view published guides"
  ON guides FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage guides"
  ON guides FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 15. Fix Payment Methods RLS Policies (Consolidate and Restrict)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view enabled payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can view all payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can insert payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can update payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can delete payment methods" ON payment_methods;

CREATE POLICY "Anyone can view enabled payment methods"
  ON payment_methods FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admins can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 16. Fix Payment Settings RLS Policies (Restrict to Admins)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Authenticated users can update payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Authenticated users can delete payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Authenticated users can view payment settings" ON payment_settings;

CREATE POLICY "Admins can view payment settings"
  ON payment_settings FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage payment settings"
  ON payment_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 17. Fix Policies RLS Policies (Consolidate and Restrict)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active policies" ON policies;
DROP POLICY IF EXISTS "Authenticated users can view all policies" ON policies;
DROP POLICY IF EXISTS "Authenticated users can insert policies" ON policies;
DROP POLICY IF EXISTS "Authenticated users can update policies" ON policies;
DROP POLICY IF EXISTS "Authenticated users can delete policies" ON policies;

CREATE POLICY "Anyone can view active policies"
  ON policies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage policies"
  ON policies FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 18. Fix Products RLS Policies (Restrict to Admins)
-- =====================================================

DROP POLICY IF EXISTS "Allow product insertion" ON products;
DROP POLICY IF EXISTS "Allow product updates" ON products;
DROP POLICY IF EXISTS "Allow product deletion" ON products;

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 19. Fix Site Settings RLS Policies (Restrict to Admins)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;

CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
