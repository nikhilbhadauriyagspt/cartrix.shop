/*
  # Create Site Settings and Content Tables

  ## New Tables
  
  ### 1. site_settings
  - `id` (uuid, primary key)
  - `brand_name` (text) - Site brand name
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `address` (text) - Business address
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. faqs
  - `id` (uuid, primary key)
  - `question` (text) - FAQ question
  - `answer` (text) - FAQ answer
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. policies
  - `id` (uuid, primary key)
  - `slug` (text, unique) - URL slug
  - `title` (text) - Policy title
  - `content` (text) - Policy content
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. guides
  - `id` (uuid, primary key)
  - `title` (text) - Guide title
  - `slug` (text, unique) - URL slug
  - `content` (text) - Guide content
  - `excerpt` (text) - Short description
  - `image_url` (text) - Featured image
  - `published` (boolean) - Published status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp

  ## Security
  - Public can read all published content
  - Only admins can manage content
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text DEFAULT 'PrinterPro',
  contact_email text,
  contact_phone text,
  address text,
  updated_at timestamptz DEFAULT now()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create guides table
CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  image_url text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings (public read)
CREATE POLICY "Site settings are publicly readable"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- RLS Policies for faqs (public read)
CREATE POLICY "FAQs are publicly readable"
  ON faqs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- RLS Policies for policies (public read)
CREATE POLICY "Policies are publicly readable"
  ON policies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage policies"
  ON policies FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- RLS Policies for guides (public read when published)
CREATE POLICY "Published guides are publicly readable"
  ON guides FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Admins can manage guides"
  ON guides FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Insert default site settings
INSERT INTO site_settings (brand_name, contact_email, contact_phone, address)
VALUES ('PrinterPro', 'support@printerpro.com', '+1 (555) 123-4567', '123 Business St, City, State 12345')
ON CONFLICT DO NOTHING;

-- Insert default policies
INSERT INTO policies (slug, title, content) VALUES
  ('privacy-policy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>'),
  ('terms-conditions', 'Terms & Conditions', '<h2>Terms & Conditions</h2><p>By using our website and services, you agree to these terms and conditions.</p>'),
  ('refund-policy', 'Refund Policy', '<h2>Refund Policy</h2><p>We offer refunds within 30 days of purchase for eligible products.</p>'),
  ('shipping-cancellation', 'Shipping & Cancellation', '<h2>Shipping & Cancellation</h2><p>Orders are typically processed within 1-2 business days.</p>')
ON CONFLICT (slug) DO NOTHING;