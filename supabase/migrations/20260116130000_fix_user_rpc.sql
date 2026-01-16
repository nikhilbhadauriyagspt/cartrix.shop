-- Re-create the function with better error handling and explicit types
CREATE OR REPLACE FUNCTION admin_get_users_by_website(target_website_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- If target_website_id is null, return nothing or handle as needed
  IF target_website_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    u.id,
    u.email::text,
    u.created_at
  FROM auth.users u
  JOIN user_website_registrations uwr ON u.id = uwr.user_id
  WHERE uwr.website_id = target_website_id
  ORDER BY u.created_at DESC;
END;
$$;
