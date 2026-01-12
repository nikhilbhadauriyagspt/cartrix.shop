/*
  # Add Function to Get Users by Website

  ## Overview
  Create a function that returns users visible to a specific website:
  - Old users (who don't have any registration record) are visible to all websites
  - New users (who have registration records) are only visible to websites they registered on

  ## Function
  - admin_get_users_by_website(target_website_id): Returns users for a specific website
*/

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
  RETURN QUERY
  SELECT DISTINCT
    u.id,
    u.email,
    u.created_at
  FROM auth.users u
  LEFT JOIN user_website_registrations uwr ON u.id = uwr.user_id
  WHERE
    uwr.user_id IS NULL
    OR uwr.website_id = target_website_id
  ORDER BY u.created_at DESC;
END;
$$;
