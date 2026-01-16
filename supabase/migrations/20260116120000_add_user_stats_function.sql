-- Function to get user counts grouped by website
CREATE OR REPLACE FUNCTION admin_get_user_stats_by_website()
RETURNS TABLE (
  website_name text,
  user_count bigint
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Users registered to specific websites
  SELECT 
    w.name as website_name,
    COUNT(uwr.user_id)::bigint as user_count
  FROM websites w
  LEFT JOIN user_website_registrations uwr ON w.id = uwr.website_id
  GROUP BY w.id, w.name
  
  UNION ALL
  
  -- Users not registered to any specific website (Shared/Legacy)
  SELECT 
    'Shared/Legacy Users' as website_name,
    COUNT(u.id)::bigint as user_count
  FROM auth.users u
  LEFT JOIN user_website_registrations uwr ON u.id = uwr.user_id
  WHERE uwr.user_id IS NULL;
END;
$$;
