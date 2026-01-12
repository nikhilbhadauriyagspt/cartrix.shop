/*
  # Create Base E-Commerce Schema

  ## New Tables
  
  ### 1. categories
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Timestamp

  ### 2. products
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `category_id` (uuid, foreign key) - Reference to categories
  - `image_url` (text) - Main product image
  - `images` (jsonb) - Additional product images array
  - `brand` (text) - Product brand
  - `stock` (integer) - Available stock
  - `is_featured` (boolean) - Featured product flag
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. orders
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Reference to auth.users (nullable for guest)
  - `guest_email` (text) - Guest email for non-registered users
  - `status` (text) - Order status
  - `total` (decimal) - Total order amount
  - `shipping_address` (jsonb) - Shipping address details
  - `payment_method` (text) - Payment method used
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. order_items
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - Reference to orders
  - `product_id` (uuid, foreign key) - Reference to products
  - `quantity` (integer) - Product quantity
  - `price` (decimal) - Price at time of purchase
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. contact_submissions
  - `id` (uuid, primary key)
  - `name` (text) - Sender name
  - `email` (text) - Sender email
  - `message` (text) - Message content
  - `created_at` (timestamptz) - Submission timestamp

  ## Security
  - Enable RLS on all tables
  - Public can read products and categories
  - Users can manage their own orders
  - Contact submissions allowed for all
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  brand text,
  stock integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO public
  USING (true);

-- RLS Policies for products  
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  TO public
  USING (true);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guests can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (guest_email IS NOT NULL);

-- RLS Policies for order_items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Inkjet Printers', 'High-quality inkjet printers for home and office use'),
  ('Laser Printers', 'Fast and efficient laser printers for professional printing'),
  ('All-in-One Printers', 'Multifunction printers with scanning and copying capabilities'),
  ('Photo Printers', 'Specialized printers for high-quality photo printing'),
  ('Ink Cartridges', 'Original and compatible ink cartridges for all printer models'),
  ('Toner Cartridges', 'Laser printer toner cartridges and supplies'),
  ('Paper & Media', 'Premium printing paper and specialty media'),
  ('Printer Accessories', 'Cables, stands, and other printer accessories')
ON CONFLICT (name) DO NOTHING;