/*
  # Add Blogs and Admin Role

  ## Overview
  This migration adds blog functionality and admin role management to the e-commerce platform.

  ## New Tables

  ### 1. blogs
  - `id` (uuid, primary key)
  - `title` (text) - Blog post title
  - `slug` (text, unique) - URL-friendly blog title
  - `excerpt` (text) - Short summary for preview
  - `content` (text) - Full blog content
  - `image_url` (text) - Featured image URL
  - `author_id` (uuid, foreign key) - Reference to auth.users
  - `published` (boolean) - Whether blog is published
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. user_roles
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `role` (text) - User role (admin, customer)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Blogs are publicly readable when published
  - Only admins can create, update, or delete blogs
  - Only admins can create, update, or delete products
  - User roles are only manageable by admins
*/

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blogs (publicly readable when published)
CREATE POLICY "Published blogs are publicly readable"
  ON blogs FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Admins can view all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update blogs"
  ON blogs FOR UPDATE
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

CREATE POLICY "Admins can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- RLS Policies for user_roles (users can view own role)
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update products RLS policies to allow admin management
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
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

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Insert sample blogs
INSERT INTO blogs (title, slug, excerpt, content, image_url, published) VALUES
  (
    'Top 10 Features to Look for in a Modern Printer',
    'top-10-printer-features',
    'Discover the essential features that make a printer perfect for your home or office needs.',
    'When shopping for a printer, it''s important to consider several key features that will affect your daily printing experience. From wireless connectivity to duplex printing, learn what matters most.<br><br><strong>1. Wireless Connectivity</strong><br>Modern printers should support Wi-Fi and mobile printing options like AirPrint and Google Cloud Print.<br><br><strong>2. Print Speed</strong><br>Consider pages per minute (PPM) ratings for both color and black-and-white printing.<br><br><strong>3. Print Quality</strong><br>Look for high DPI (dots per inch) resolution for crisp, professional-looking documents.<br><br><strong>4. Duplex Printing</strong><br>Automatic two-sided printing saves paper and is better for the environment.<br><br><strong>5. Paper Capacity</strong><br>Larger paper trays mean fewer refills and better productivity.<br><br><strong>6. Ink Efficiency</strong><br>Check the cost per page and ink cartridge yields to save money long-term.<br><br><strong>7. Scanning and Copying</strong><br>All-in-one functionality adds value and saves desk space.<br><br><strong>8. Touchscreen Display</strong><br>Intuitive controls make printing tasks easier and faster.<br><br><strong>9. Mobile App Support</strong><br>Dedicated apps let you print from anywhere and monitor printer status.<br><br><strong>10. Warranty and Support</strong><br>Good customer service and warranty coverage provide peace of mind.',
    'https://images.pexels.com/photos/4792286/pexels-photo-4792286.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'Laser vs Inkjet: Which Printer is Right for You?',
    'laser-vs-inkjet-comparison',
    'Not sure whether to choose a laser or inkjet printer? This comprehensive guide will help you make the right decision.',
    'The choice between laser and inkjet printers depends on your specific needs, budget, and printing habits. Let''s break down the key differences.<br><br><strong>Laser Printers</strong><br>Laser printers use toner powder and are ideal for high-volume printing. They excel at text documents and offer faster print speeds, typically 20-40 pages per minute. While the upfront cost is higher, the cost per page is lower, making them economical for busy offices.<br><br><strong>Advantages of Laser Printers:</strong><br>- Fast printing speeds<br>- Lower cost per page<br>- Sharp text quality<br>- Toner doesn''t dry out<br>- Better for high-volume printing<br><br><strong>Inkjet Printers</strong><br>Inkjet printers spray liquid ink onto paper and are better for photo printing and color documents. They have a lower initial cost but higher per-page costs. Perfect for home users and small businesses with moderate printing needs.<br><br><strong>Advantages of Inkjet Printers:</strong><br>- Lower upfront cost<br>- Superior photo quality<br>- Better color accuracy<br>- Compact size<br>- Can print on various media types<br><br><strong>Making Your Decision</strong><br>Choose laser if you print mostly text documents in high volumes. Choose inkjet if you print photos, need vibrant colors, or have a limited budget. Consider your monthly print volume, types of documents, and available space when making your decision.',
    'https://images.pexels.com/photos/6044226/pexels-photo-6044226.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'How to Maintain Your Printer for Optimal Performance',
    'printer-maintenance-tips',
    'Keep your printer running smoothly with these essential maintenance tips and best practices.',
    'Regular maintenance can significantly extend your printer''s lifespan and ensure consistent print quality. Follow these professional tips to keep your printer in top condition.<br><br><strong>Daily Maintenance</strong><br>Keep your printer powered on to allow automatic maintenance cycles. Use your printer regularly to prevent ink from drying or toner from settling. Keep the printer in a dust-free environment with good ventilation.<br><br><strong>Weekly Maintenance</strong><br>Clean the exterior with a soft, lint-free cloth. Check paper trays for dust and debris. Ensure the printer is on a stable, level surface.<br><br><strong>Monthly Maintenance</strong><br>Run the printer''s built-in cleaning cycle. Check and clean print heads (for inkjet printers). Inspect and clean the paper feed rollers. Update printer firmware and drivers.<br><br><strong>Best Practices</strong><br>Use quality paper appropriate for your printer. Store paper properly to prevent moisture absorption. Replace ink or toner cartridges before they''re completely empty. Keep spare cartridges on hand to avoid printing interruptions.<br><br><strong>Troubleshooting Common Issues</strong><br>If you experience streaky prints, run a cleaning cycle. For paper jams, always remove paper carefully in the direction of the paper path. If colors look off, perform a color calibration.<br><br><strong>When to Call for Service</strong><br>Contact professional service if you experience persistent paper jams, strange noises, error messages, or print quality issues that don''t improve with cleaning.',
    'https://images.pexels.com/photos/5052875/pexels-photo-5052875.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  )
ON CONFLICT (slug) DO NOTHING;
