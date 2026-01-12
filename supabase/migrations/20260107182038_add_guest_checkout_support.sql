/*
  # Add Guest Checkout Support
  
  This migration enables guest checkout functionality:
  
  1. **Orders Table Modifications**
     - Make user_id nullable to support guest orders
     - Add guest information fields (name, email, phone)
     - Add is_guest flag to identify guest orders
  
  2. **Cart Items Table Modifications**
     - Add session_id field for guest cart tracking
     - Make user_id nullable for guest carts
  
  3. **RLS Policy Updates**
     - Allow anonymous users to create guest orders
     - Allow anonymous users to manage guest cart items via session_id
     - Maintain security for authenticated users
*/

-- =====================================================
-- 1. Modify Orders Table for Guest Support
-- =====================================================

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest boolean DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone text;

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email) WHERE is_guest = true;

-- =====================================================
-- 2. Modify Cart Items Table for Guest Support
-- =====================================================

ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS session_id text;

-- Add index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id) WHERE session_id IS NOT NULL;

-- Add check constraint to ensure either user_id or session_id is present
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_or_session_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_or_session_check 
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);

-- =====================================================
-- 3. Update Cart Items RLS Policies for Guest Support
-- =====================================================

DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Guest users can view cart by session_id, authenticated users by user_id
CREATE POLICY "Users and guests can view cart items"
  ON cart_items FOR SELECT
  USING (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (session_id IS NOT NULL)
  );

-- Allow both authenticated and guest users to insert cart items
CREATE POLICY "Users and guests can insert cart items"
  ON cart_items FOR INSERT
  WITH CHECK (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (session_id IS NOT NULL AND user_id IS NULL)
  );

-- Allow both authenticated and guest users to update their cart items
CREATE POLICY "Users and guests can update cart items"
  ON cart_items FOR UPDATE
  USING (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (session_id IS NOT NULL)
  )
  WITH CHECK (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (session_id IS NOT NULL AND user_id IS NULL)
  );

-- Allow both authenticated and guest users to delete their cart items
CREATE POLICY "Users and guests can delete cart items"
  ON cart_items FOR DELETE
  USING (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (session_id IS NOT NULL)
  );

-- =====================================================
-- 4. Update Orders RLS Policies for Guest Support
-- =====================================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Allow viewing orders for authenticated users and guest orders
CREATE POLICY "Users and guests can view orders"
  ON orders FOR SELECT
  USING (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (is_guest = true)
  );

-- Allow creating orders for authenticated users and guest users
CREATE POLICY "Users and guests can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (is_guest = true AND user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Allow updating orders for authenticated users and guest users
CREATE POLICY "Users and guests can update orders"
  ON orders FOR UPDATE
  USING (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (is_guest = true)
  )
  WITH CHECK (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid())) OR
    (is_guest = true AND user_id IS NULL)
  );

-- =====================================================
-- 5. Update Order Items RLS Policies for Guest Support
-- =====================================================

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items for own orders" ON order_items;

-- Allow viewing order items for authenticated users and guest orders
CREATE POLICY "Users and guests can view order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        (orders.user_id IS NOT NULL AND orders.user_id = (SELECT auth.uid())) OR
        orders.is_guest = true
      )
    )
  );

-- Allow inserting order items for authenticated users and guest orders
CREATE POLICY "Users and guests can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        (orders.user_id IS NOT NULL AND orders.user_id = (SELECT auth.uid())) OR
        orders.is_guest = true
      )
    )
  );

-- =====================================================
-- 6. Create Function to Merge Guest Cart to User Cart
-- =====================================================

CREATE OR REPLACE FUNCTION merge_guest_cart_to_user(
  p_session_id text,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update guest cart items to associate with user
  -- If item already exists in user cart, update quantity; otherwise transfer
  INSERT INTO cart_items (user_id, product_id, quantity, created_at)
  SELECT 
    p_user_id,
    product_id,
    quantity,
    NOW()
  FROM cart_items
  WHERE session_id = p_session_id
  ON CONFLICT (user_id, product_id) 
  DO UPDATE SET 
    quantity = cart_items.quantity + EXCLUDED.quantity,
    updated_at = NOW();
  
  -- Delete the guest cart items
  DELETE FROM cart_items WHERE session_id = p_session_id;
END;
$$;

-- =====================================================
-- 7. Create Function to Convert Guest Order to User Order
-- =====================================================

CREATE OR REPLACE FUNCTION convert_guest_order_to_user(
  p_order_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update the order to associate with user
  UPDATE orders
  SET 
    user_id = p_user_id,
    is_guest = false,
    updated_at = NOW()
  WHERE id = p_order_id AND is_guest = true;
END;
$$;
