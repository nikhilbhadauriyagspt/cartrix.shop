/*
  # Create Payment Settings and Storage

  ## New Tables
  
  ### 1. payment_methods
  - `id` (uuid, primary key)
  - `name` (text) - Payment method name
  - `type` (text) - Payment type
  - `enabled` (boolean) - Is enabled
  - `config` (jsonb) - Configuration data
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. payment_settings
  - `id` (uuid, primary key)
  - `provider` (text) - Payment provider
  - `api_key` (text) - API key (encrypted in production)
  - `enabled` (boolean) - Is enabled
  - `created_at` (timestamptz) - Creation timestamp

  ## Storage Buckets
  - product-images: For product photos
  - guide-images: For guide featured images
  
  ## Security
  - Public can read payment methods (not settings)
  - Only admins can manage payment configuration
  - Storage buckets have public read access
*/

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cod', 'online', 'wallet')),
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  api_key text,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods (public read)
CREATE POLICY "Payment methods are publicly readable"
  ON payment_methods FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Admins can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- RLS Policies for payment_settings (admin only)
CREATE POLICY "Admins can view payment settings"
  ON payment_settings FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can manage payment settings"
  ON payment_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Insert default payment methods
INSERT INTO payment_methods (name, type, enabled) VALUES
  ('Cash on Delivery', 'cod', true),
  ('Credit/Debit Card', 'online', false),
  ('UPI', 'online', false)
ON CONFLICT DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('guide-images', 'guide-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Storage policies for guide-images
CREATE POLICY "Public can view guide images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'guide-images');

CREATE POLICY "Admins can upload guide images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'guide-images' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update guide images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'guide-images' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete guide images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'guide-images' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );