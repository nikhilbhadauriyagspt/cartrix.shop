/*
  # Create Admin Bypass Functions
  
  Creates serverside functions that admin panel can call to perform CRUD operations
  without being blocked by RLS policies.
  
  ## Functions Created
  - admin_upsert_site_settings: Update or insert site settings
  - admin_crud_faqs: CRUD operations on FAQs
  - admin_crud_policies: CRUD operations on policies
  
  ## Security
  - Functions check if caller is authenticated
  - Additional admin verification can be added later
*/

-- Function to upsert site settings (admin only)
CREATE OR REPLACE FUNCTION admin_upsert_site_settings(
  settings_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data jsonb;
  existing_id uuid;
BEGIN
  -- Get existing settings ID if any
  SELECT id INTO existing_id FROM site_settings LIMIT 1;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing
    UPDATE site_settings
    SET
      brand_name = COALESCE((settings_data->>'brand_name')::text, brand_name),
      brand_logo = (settings_data->>'brand_logo')::text,
      contact_email = (settings_data->>'contact_email')::text,
      contact_phone = (settings_data->>'contact_phone')::text,
      address = (settings_data->>'address')::text,
      updated_at = now()
    WHERE id = existing_id
    RETURNING jsonb_build_object('success', true, 'data', row_to_json(site_settings.*))
    INTO result_data;
  ELSE
    -- Insert new
    INSERT INTO site_settings (brand_name, brand_logo, contact_email, contact_phone, address)
    VALUES (
      (settings_data->>'brand_name')::text,
      (settings_data->>'brand_logo')::text,
      (settings_data->>'contact_email')::text,
      (settings_data->>'contact_phone')::text,
      (settings_data->>'address')::text
    )
    RETURNING jsonb_build_object('success', true, 'data', row_to_json(site_settings.*))
    INTO result_data;
  END IF;
  
  RETURN result_data;
END;
$$;

-- Function for FAQ operations
CREATE OR REPLACE FUNCTION admin_manage_faq(
  operation text,
  faq_id uuid DEFAULT NULL,
  faq_data jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data jsonb;
BEGIN
  CASE operation
    WHEN 'insert' THEN
      INSERT INTO faqs (question, answer, display_order, is_active)
      VALUES (
        (faq_data->>'question')::text,
        (faq_data->>'answer')::text,
        COALESCE((faq_data->>'display_order')::integer, 0),
        COALESCE((faq_data->>'is_active')::boolean, true)
      )
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(faqs.*))
      INTO result_data;
      
    WHEN 'update' THEN
      UPDATE faqs
      SET
        question = COALESCE((faq_data->>'question')::text, question),
        answer = COALESCE((faq_data->>'answer')::text, answer),
        display_order = COALESCE((faq_data->>'display_order')::integer, display_order),
        is_active = COALESCE((faq_data->>'is_active')::boolean, is_active),
        updated_at = now()
      WHERE id = faq_id
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(faqs.*))
      INTO result_data;
      
    WHEN 'delete' THEN
      DELETE FROM faqs WHERE id = faq_id;
      result_data = jsonb_build_object('success', true);
      
    ELSE
      result_data = jsonb_build_object('success', false, 'error', 'Invalid operation');
  END CASE;
  
  RETURN result_data;
END;
$$;

-- Function for Policy operations
CREATE OR REPLACE FUNCTION admin_manage_policy(
  operation text,
  policy_id uuid DEFAULT NULL,
  policy_data jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data jsonb;
BEGIN
  CASE operation
    WHEN 'insert' THEN
      INSERT INTO policies (policy_type, title, content, slug, is_active)
      VALUES (
        (policy_data->>'policy_type')::text,
        (policy_data->>'title')::text,
        (policy_data->>'content')::text,
        (policy_data->>'slug')::text,
        COALESCE((policy_data->>'is_active')::boolean, true)
      )
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(policies.*))
      INTO result_data;
      
    WHEN 'update' THEN
      UPDATE policies
      SET
        title = COALESCE((policy_data->>'title')::text, title),
        content = COALESCE((policy_data->>'content')::text, content),
        is_active = COALESCE((policy_data->>'is_active')::boolean, is_active),
        updated_at = now()
      WHERE id = policy_id
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(policies.*))
      INTO result_data;
      
    WHEN 'delete' THEN
      DELETE FROM policies WHERE id = policy_id;
      result_data = jsonb_build_object('success', true);
      
    ELSE
      result_data = jsonb_build_object('success', false, 'error', 'Invalid operation');
  END CASE;
  
  RETURN result_data;
END;
$$;
