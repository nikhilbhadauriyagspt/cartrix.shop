/*
  # Fix admin_get_all_users Type Mismatch

  Fixes the type mismatch error in admin_get_all_users function where
  auth.users.email is VARCHAR(255) but the function expects TEXT.

  ## Changes
  - Update admin_get_all_users to cast email to text explicitly
*/

-- Drop and recreate the function with proper type casting
DROP FUNCTION IF EXISTS admin_get_all_users();

CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Set search path for security
ALTER FUNCTION admin_get_all_users SET search_path = public, pg_temp;