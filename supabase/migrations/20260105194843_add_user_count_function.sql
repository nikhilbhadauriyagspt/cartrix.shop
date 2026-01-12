/*
  # Add user count function

  1. New Functions
    - `get_user_count` - Returns count of users from auth.users table
  
  2. Security
    - Function is SECURITY DEFINER to allow counting auth.users
*/

CREATE OR REPLACE FUNCTION get_user_count()
RETURNS bigint AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM auth.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;