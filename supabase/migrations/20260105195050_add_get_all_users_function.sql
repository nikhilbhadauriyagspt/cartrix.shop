/*
  # Add get all users function

  1. New Functions
    - `get_all_users` - Returns all users from auth.users table with basic info
  
  2. Security
    - Function is SECURITY DEFINER to allow reading auth.users
*/

CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;