/*
  # Update Admin Functions for Website Support

  ## Overview
  Update admin_manage_faq and admin_manage_policy functions to handle website_id

  ## Changes
  1. Update admin_manage_faq to accept and use website_id
  2. Update admin_manage_policy to accept and use website_id
  
  ## Important Notes
  - Functions now properly handle website_id when creating/updating FAQs and policies
  - Maintains backward compatibility with SECURITY DEFINER
*/

-- Update admin_manage_faq function
CREATE OR REPLACE FUNCTION admin_manage_faq(
  operation text,
  faq_id uuid DEFAULT NULL,
  faq_data jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data jsonb;
BEGIN
  CASE operation
    WHEN 'insert' THEN
      INSERT INTO faqs (question, answer, display_order, is_active, website_id)
      VALUES (
        (faq_data->>'question')::text,
        (faq_data->>'answer')::text,
        COALESCE((faq_data->>'display_order')::integer, 0),
        COALESCE((faq_data->>'is_active')::boolean, true),
        COALESCE((faq_data->>'website_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
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
        website_id = COALESCE((faq_data->>'website_id')::uuid, website_id),
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

-- Update admin_manage_policy function
CREATE OR REPLACE FUNCTION admin_manage_policy(
  operation text,
  policy_id uuid DEFAULT NULL,
  policy_data jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data jsonb;
BEGIN
  CASE operation
    WHEN 'insert' THEN
      INSERT INTO policies (policy_type, title, content, slug, is_active, website_id)
      VALUES (
        (policy_data->>'policy_type')::text,
        (policy_data->>'title')::text,
        (policy_data->>'content')::text,
        (policy_data->>'slug')::text,
        COALESCE((policy_data->>'is_active')::boolean, true),
        COALESCE((policy_data->>'website_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
      )
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(policies.*))
      INTO result_data;
      
    WHEN 'update' THEN
      UPDATE policies
      SET
        title = COALESCE((policy_data->>'title')::text, title),
        content = COALESCE((policy_data->>'content')::text, content),
        is_active = COALESCE((policy_data->>'is_active')::boolean, is_active),
        website_id = COALESCE((policy_data->>'website_id')::uuid, website_id),
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
