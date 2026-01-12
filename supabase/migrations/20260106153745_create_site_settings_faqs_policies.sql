/*
  # Create Site Settings, FAQs, and Policies Tables

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `brand_name` (text)
      - `brand_logo` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `address` (text)
      - `updated_at` (timestamptz)
      
    - `faqs`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `display_order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `policies`
      - `id` (uuid, primary key)
      - `policy_type` (text) - privacy, terms, refund, shipping
      - `title` (text)
      - `content` (text)
      - `slug` (text, unique)
      - `is_active` (boolean)
      - `updated_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for site_settings, faqs, and policies
    - Admin-only write access for all tables
    
  3. Initial Data
    - Insert default site settings with brand name "Printer Pro"
    - Insert default policy pages
    - Insert sample FAQs
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL DEFAULT 'Printer Pro',
  brand_logo text,
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
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- RLS Policies for faqs
CREATE POLICY "Anyone can view active FAQs"
  ON faqs FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- RLS Policies for policies
CREATE POLICY "Anyone can view active policies"
  ON policies FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all policies"
  ON policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete policies"
  ON policies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Insert default site settings
INSERT INTO site_settings (brand_name, contact_email, contact_phone)
VALUES ('Printer Pro', 'info@printerpro.com', '+1-234-567-8900')
ON CONFLICT DO NOTHING;

-- Insert default policies
INSERT INTO policies (policy_type, title, content, slug) VALUES
('privacy', 'Privacy Policy', 'Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.

## Information We Collect
We collect information that you provide directly to us, including name, email address, phone number, and shipping address when you make a purchase.

## How We Use Your Information
- Process and fulfill your orders
- Send order confirmations and updates
- Respond to your inquiries
- Improve our services

## Data Security
We implement appropriate security measures to protect your personal information.

## Contact Us
If you have questions about this policy, please contact us at info@printerpro.com', 'privacy-policy'),

('terms', 'Terms & Conditions', 'Please read these terms and conditions carefully before using our service.

## Acceptance of Terms
By accessing and using this website, you accept and agree to be bound by these terms.

## Use License
Permission is granted to temporarily download one copy of materials on our website for personal, non-commercial transitory viewing only.

## Product Information
We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, or error-free.

## Pricing
All prices are subject to change without notice. We reserve the right to modify or discontinue products without notice.

## Orders and Payment
By placing an order, you agree to provide accurate and complete information. We reserve the right to refuse or cancel any order.

## Contact Us
For questions about these terms, contact us at info@printerpro.com', 'terms-conditions'),

('refund', 'Refund Policy', 'We want you to be completely satisfied with your purchase.

## Returns
You may return most new, unopened items within 30 days of delivery for a full refund.

## Refund Process
1. Contact us to initiate a return
2. Ship the item back in original packaging
3. Refund will be processed within 7-10 business days

## Non-Returnable Items
- Opened software or digital products
- Custom-made or personalized items
- Clearance items

## Damaged or Defective Items
If you receive a damaged or defective item, contact us immediately with photos. We will arrange a replacement or full refund.

## Shipping Costs
Original shipping charges are non-refundable. Return shipping costs are the customer''s responsibility unless the item is defective.

## Contact Us
For return requests, email us at info@printerpro.com', 'refund-policy'),

('shipping', 'Shipping & Cancellation Policy', 'Information about shipping and order cancellations.

## Shipping Information
- Standard shipping: 5-7 business days
- Express shipping: 2-3 business days
- Free shipping on orders over $500

## Shipping Charges
Shipping charges are calculated based on weight and destination. Charges are displayed at checkout.

## Order Processing
Orders are typically processed within 1-2 business days. You will receive a tracking number once your order ships.

## Cancellation Policy
You may cancel your order within 24 hours of placement for a full refund. After this period, cancellation may not be possible if the order has been processed.

## Order Modifications
To modify your order, contact us immediately. We will do our best to accommodate changes if the order has not been processed.

## International Shipping
Currently, we only ship within the United States.

## Contact Us
For shipping inquiries, contact us at info@printerpro.com', 'shipping-cancellation')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, display_order) VALUES
('How do I place an order?', 'Browse our products, add items to your cart, and proceed to checkout. You''ll need to create an account or sign in to complete your purchase.', 1),
('What payment methods do you accept?', 'We accept credit/debit cards, UPI, net banking, and cash on delivery (COD) for eligible orders.', 2),
('How long does shipping take?', 'Standard shipping takes 5-7 business days. Express shipping options are available at checkout for faster delivery.', 3),
('Can I track my order?', 'Yes! Once your order ships, you''ll receive a tracking number via email. You can also track your order in the Orders section of your account.', 4),
('What is your return policy?', 'We accept returns within 30 days of delivery for most items. Items must be unopened and in original packaging. See our Refund Policy for details.', 5),
('Do you offer bulk discounts?', 'Yes, we offer special pricing for bulk orders. Contact us at info@printerpro.com with your requirements for a custom quote.', 6),
('How do I cancel my order?', 'You can cancel your order within 24 hours of placement by contacting us immediately. After this period, cancellation may not be possible.', 7),
('Are products covered under warranty?', 'Yes, most products come with manufacturer warranty. Warranty terms vary by product and are mentioned in product descriptions.', 8)
ON CONFLICT DO NOTHING;