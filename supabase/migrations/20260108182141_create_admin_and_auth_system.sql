/*
  # Create Admin Authentication System

  ## New Tables
  
  ### 1. admins
  - `id` (uuid, primary key)
  - `email` (text, unique) - Admin email
  - `password_hash` (text) - Hashed password
  - `name` (text) - Admin name
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp
  - `last_login` (timestamptz) - Last login timestamp

  ## Security
  - Enable RLS on admins table
  - Create password verification function
  - Default admin: admin@printerpro.com / Admin@12345
*/

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

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading admin data (for login verification)
CREATE POLICY "Allow admin login"
  ON admins FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Admins can update own data
CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (true);

-- Insert default admin account
INSERT INTO admins (email, password_hash, name)
VALUES (
  'admin@printerpro.com',
  crypt('Admin@12345', gen_salt('bf')),
  'Admin User'
)
ON CONFLICT (email) DO NOTHING;

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(admin_email text, admin_password text)
RETURNS TABLE(id uuid, email text, name text) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email, a.name
  FROM admins a
  WHERE a.email = admin_email
    AND a.password_hash = crypt(admin_password, a.password_hash);
END;
$$;

-- Function to update admin password
CREATE OR REPLACE FUNCTION update_admin_password(admin_id uuid, new_password text)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE admins
  SET password_hash = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = admin_id;
  RETURN FOUND;
END;
$$;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_admin_last_login(admin_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE admins
  SET last_login = now()
  WHERE id = admin_id;
END;
$$;