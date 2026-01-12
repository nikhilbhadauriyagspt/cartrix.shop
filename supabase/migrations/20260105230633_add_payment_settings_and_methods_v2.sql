/*
  # Add Payment Settings and Payment Methods

  1. New Tables
    - `payment_settings`
      - `id` (uuid, primary key)
      - `gateway_name` (text) - Name of payment gateway (e.g., Razorpay, Stripe, PayPal)
      - `api_key` (text) - API Key
      - `api_secret` (text) - API Secret
      - `is_enabled` (boolean) - Whether this gateway is active
      - `is_test_mode` (boolean) - Test/Live mode
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_methods`
      - `id` (uuid, primary key)
      - `method_name` (text) - e.g., "Credit/Debit Card", "UPI", "Net Banking", "Cash on Delivery"
      - `method_type` (text) - "gateway" or "cod"
      - `is_enabled` (boolean)
      - `display_order` (integer)
      - `created_at` (timestamptz)

  2. Changes
    - Add payment-related columns to `orders` table:
      - `payment_method` (text)
      - `payment_status` (text) - pending, completed, failed, refunded
      - `payment_transaction_id` (text)
      - `payment_gateway` (text)

  3. Security
    - Enable RLS on new tables
    - Payment settings accessible through authenticated requests (admin panel protected at app level)
    - Payment methods readable by all users, modifiable by authenticated users (admin protected at app level)
    - Default payment methods added (COD enabled by default)
*/

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name text NOT NULL UNIQUE,
  api_key text,
  api_secret text,
  is_enabled boolean DEFAULT false,
  is_test_mode boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method_name text NOT NULL UNIQUE,
  method_type text NOT NULL CHECK (method_type IN ('gateway', 'cod')),
  is_enabled boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add payment columns to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cod';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_transaction_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_gateway'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_gateway text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_settings (Accessible to authenticated users, admin protection at app level)
CREATE POLICY "Authenticated users can view payment settings"
  ON payment_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payment settings"
  ON payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payment settings"
  ON payment_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payment settings"
  ON payment_settings FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for payment_methods (Public read for enabled methods, admin write)
CREATE POLICY "Anyone can view enabled payment methods"
  ON payment_methods FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Authenticated users can view all payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (true);

-- Insert default payment methods
INSERT INTO payment_methods (method_name, method_type, is_enabled, display_order) 
VALUES 
  ('Cash on Delivery', 'cod', true, 1),
  ('Credit/Debit Card', 'gateway', false, 2),
  ('UPI', 'gateway', false, 3),
  ('Net Banking', 'gateway', false, 4),
  ('Wallet', 'gateway', false, 5)
ON CONFLICT (method_name) DO NOTHING;

-- Insert default payment gateway placeholders
INSERT INTO payment_settings (gateway_name, is_enabled, is_test_mode)
VALUES 
  ('Razorpay', false, true),
  ('Stripe', false, true),
  ('PayPal', false, true)
ON CONFLICT (gateway_name) DO NOTHING;