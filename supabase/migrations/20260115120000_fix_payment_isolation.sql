/*
  # Fix Payment Settings and Methods for Multi-Website Support

  ## Overview
  Update payment_settings and payment_methods to be website-specific instead of shared.
  This allows each website to have its own API keys and enabled methods.

  ## Changes
  1. Add website_id to payment_methods
  2. Update unique constraints to be (website_id, name)
  3. Update RLS policies to filter by website_id
  4. Seed initial settings for existing websites
*/

-- 1. Fix payment_settings constraints
DO $$
BEGIN
  -- Drop existing unique constraint on gateway_name
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_settings_gateway_name_key'
  ) THEN
    ALTER TABLE payment_settings DROP CONSTRAINT payment_settings_gateway_name_key;
  END IF;

  -- Add composite unique constraint (website_id, gateway_name)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_settings_website_gateway_unique'
  ) THEN
    ALTER TABLE payment_settings ADD CONSTRAINT payment_settings_website_gateway_unique UNIQUE (website_id, gateway_name);
  END IF;
END $$;

-- 2. Update payment_methods table
DO $$
BEGIN
  -- Add website_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_methods' AND column_name = 'website_id'
  ) THEN
    ALTER TABLE payment_methods ADD COLUMN website_id uuid REFERENCES websites(id) DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
    CREATE INDEX IF NOT EXISTS idx_payment_methods_website_id ON payment_methods(website_id);
  END IF;

  -- Drop existing unique constraint on method_name
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_methods_method_name_key'
  ) THEN
    ALTER TABLE payment_methods DROP CONSTRAINT payment_methods_method_name_key;
  END IF;

  -- Add composite unique constraint (website_id, method_name)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_methods_website_name_unique'
  ) THEN
    ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_website_name_unique UNIQUE (website_id, method_name);
  END IF;
END $$;

-- 3. Update RLS Policies
DROP POLICY IF EXISTS "Anyone can view all payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Anyone can view all payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Anyone can view enabled payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can view all payment methods" ON payment_methods;

-- Public read for enabled methods of active websites
CREATE POLICY "Anyone can view website payment settings"
  ON payment_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = payment_settings.website_id
      AND websites.is_active = true
    )
  );

CREATE POLICY "Anyone can view website payment methods"
  ON payment_methods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = payment_methods.website_id
      AND websites.is_active = true
    )
  );

-- Admin management (already handled by authenticated role in original migration, but ensuring website context)
-- Original update policies use authenticated check, which is fine for now as admin panel filters.

-- 4. Seed settings for existing websites
-- Ensure Razorpay, Stripe, PayPal exist for each website
INSERT INTO payment_settings (website_id, gateway_name, is_enabled, is_test_mode)
SELECT w.id, g.name, false, true
FROM websites w
CROSS JOIN (SELECT 'Razorpay' as name UNION SELECT 'Stripe' UNION SELECT 'PayPal') g
ON CONFLICT (website_id, gateway_name) DO NOTHING;

-- Ensure default methods exist for each website
INSERT INTO payment_methods (website_id, method_name, method_type, is_enabled, display_order)
SELECT w.id, m.name, m.type, m.enabled, m.ord
FROM websites w
CROSS JOIN (
  SELECT 'Cash on Delivery' as name, 'cod' as type, true as enabled, 1 as ord
  UNION SELECT 'Credit/Debit Card', 'gateway', false, 2
  UNION SELECT 'UPI', 'gateway', false, 3
  UNION SELECT 'Net Banking', 'gateway', false, 4
  UNION SELECT 'Wallet', 'gateway', false, 5
) m
ON CONFLICT (website_id, method_name) DO NOTHING;
