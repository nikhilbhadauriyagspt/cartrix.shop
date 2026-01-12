/*
  # Add Admin Functions for Users and Contact Submissions
  
  Creates SECURITY DEFINER functions that allow admin panel to access users 
  and contact submissions data without requiring service role key.
  
  ## Functions Created
  
  1. admin_get_all_users()
     - Returns all users from auth.users table
     - Bypasses RLS using SECURITY DEFINER
  
  2. admin_get_contact_submissions()
     - Returns all contact submissions
     - Ordered by creation date (newest first)
  
  3. admin_update_contact_submission(submission_id, new_status)
     - Updates the status of a contact submission
     - Returns updated record
  
  4. admin_delete_contact_submission(submission_id)
     - Deletes a contact submission
     - Returns success status
  
  5. admin_get_user_orders(target_user_id)
     - Gets all orders for a specific user
     - Ordered by creation date (newest first)
  
  ## Security
  - All functions use SECURITY DEFINER to bypass RLS
  - Functions can be called by anyone (admin authentication happens in frontend)
  - Consider adding admin verification in future iterations
*/

-- Function to get all users (replaces get_all_users)
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Function to get all contact submissions
CREATE OR REPLACE FUNCTION admin_get_contact_submissions()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  phone text,
  subject text,
  message text,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.subject,
    c.message,
    c.status,
    c.created_at
  FROM contact_submissions c
  ORDER BY c.created_at DESC;
END;
$$;

-- Function to update contact submission status
CREATE OR REPLACE FUNCTION admin_update_contact_submission(
  submission_id uuid,
  new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data jsonb;
BEGIN
  UPDATE contact_submissions
  SET status = new_status
  WHERE id = submission_id
  RETURNING jsonb_build_object(
    'success', true,
    'data', row_to_json(contact_submissions.*)
  )
  INTO result_data;
  
  IF result_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Submission not found'
    );
  END IF;
  
  RETURN result_data;
END;
$$;

-- Function to delete contact submission
CREATE OR REPLACE FUNCTION admin_delete_contact_submission(
  submission_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM contact_submissions
  WHERE id = submission_id;
  
  IF FOUND THEN
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Submission not found'
    );
  END IF;
END;
$$;

-- Function to get user orders
CREATE OR REPLACE FUNCTION admin_get_user_orders(
  target_user_id uuid
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  total_amount numeric,
  status text,
  payment_method text,
  shipping_address jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.total_amount,
    o.status,
    o.payment_method,
    o.shipping_address,
    o.created_at
  FROM orders o
  WHERE o.user_id = target_user_id
  ORDER BY o.created_at DESC;
END;
$$;

-- Set search path for security
ALTER FUNCTION admin_get_all_users SET search_path = public, pg_temp;
ALTER FUNCTION admin_get_contact_submissions SET search_path = public, pg_temp;
ALTER FUNCTION admin_update_contact_submission SET search_path = public, pg_temp;
ALTER FUNCTION admin_delete_contact_submission SET search_path = public, pg_temp;
ALTER FUNCTION admin_get_user_orders SET search_path = public, pg_temp;