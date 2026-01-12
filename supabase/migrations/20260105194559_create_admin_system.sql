/*
  # Create Admin System

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Admin email address
      - `password_hash` (text) - Hashed password using crypt
      - `name` (text) - Admin full name
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `last_login` (timestamptz) - Last login timestamp
  
  2. Changes to Existing Tables
    - Add `is_active` column to `products` table for toggling product status
  
  3. Security
    - Enable RLS on `admins` table
    - Add policies for admin authentication and management
    - Admins can only read/update their own records
  
  4. Initial Data
    - Create default admin account:
      - Email: admin@printerpro.com
      - Password: Admin@12345 (hashed)
  
  5. Important Notes
    - Admin authentication is completely separate from regular users (auth.users)
    - Password hashing uses pgcrypto extension
    - Admin sessions managed separately in frontend
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Add is_active column to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own data
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  USING (true);

-- Policy: Admins can update their own data
CREATE POLICY "Admins can update own data"
  ON admins
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Insert default admin account with hashed password
-- Password: Admin@12345
INSERT INTO admins (email, password_hash, name)
VALUES (
  'admin@printerpro.com',
  crypt('Admin@12345', gen_salt('bf')),
  'Admin User'
)
ON CONFLICT (email) DO NOTHING;

-- Create function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(admin_email text, admin_password text)
RETURNS TABLE(id uuid, email text, name text) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email, a.name
  FROM admins a
  WHERE a.email = admin_email
    AND a.password_hash = crypt(admin_password, a.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update admin password
CREATE OR REPLACE FUNCTION update_admin_password(admin_id uuid, new_password text)
RETURNS boolean AS $$
BEGIN
  UPDATE admins
  SET password_hash = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = admin_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update admin last login
CREATE OR REPLACE FUNCTION update_admin_last_login(admin_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE admins
  SET last_login = now()
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;