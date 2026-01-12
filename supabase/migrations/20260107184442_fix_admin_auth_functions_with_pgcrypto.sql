/*
  # Fix Admin Authentication Functions

  1. Changes
    - Updates verify_admin_password function to use extensions.crypt() with full schema path
    - Updates update_admin_password function to use extensions.crypt() and extensions.gen_salt()
    - Ensures pgcrypto functions are properly referenced from the extensions schema

  2. Purpose
    - Fixes admin login issue where crypt() function was not found in search_path
    - Allows admin users to log in successfully
*/

CREATE OR REPLACE FUNCTION verify_admin_password(admin_email text, admin_password text)
RETURNS TABLE(id uuid, email text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
RETURN QUERY
SELECT a.id, a.email, a.name
FROM admins a
WHERE a.email = admin_email
AND a.password_hash = extensions.crypt(admin_password, a.password_hash);
END;
$$;

CREATE OR REPLACE FUNCTION update_admin_password(admin_id uuid, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
UPDATE admins
SET 
  password_hash = extensions.crypt(new_password, extensions.gen_salt('bf')),
  updated_at = now()
WHERE id = admin_id;

RETURN FOUND;
END;
$$;
