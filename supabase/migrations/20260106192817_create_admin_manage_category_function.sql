/*
  # Create Admin Category Management Function
  
  Creates a serverside function that admin panel can call to perform CRUD operations
  on categories without being blocked by RLS policies.
  
  ## Functions Created
  - admin_manage_category: CRUD operations on categories (insert, update, delete)
  
  ## Security
  - Function uses SECURITY DEFINER to bypass RLS
  - Admin verification is handled at the application layer
*/

-- Function for Category operations
CREATE OR REPLACE FUNCTION admin_manage_category(
  operation text,
  category_id uuid DEFAULT NULL,
  category_data jsonb DEFAULT NULL
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
      INSERT INTO categories (name, slug, description, is_active)
      VALUES (
        (category_data->>'name')::text,
        (category_data->>'slug')::text,
        (category_data->>'description')::text,
        COALESCE((category_data->>'is_active')::boolean, true)
      )
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(categories.*))
      INTO result_data;
      
    WHEN 'update' THEN
      UPDATE categories
      SET
        name = COALESCE((category_data->>'name')::text, name),
        slug = COALESCE((category_data->>'slug')::text, slug),
        description = COALESCE((category_data->>'description')::text, description),
        is_active = COALESCE((category_data->>'is_active')::boolean, is_active),
        updated_at = now()
      WHERE id = category_id
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(categories.*))
      INTO result_data;
      
    WHEN 'delete' THEN
      DELETE FROM categories WHERE id = category_id;
      result_data = jsonb_build_object('success', true);
      
    ELSE
      result_data = jsonb_build_object('success', false, 'error', 'Invalid operation');
  END CASE;
  
  RETURN result_data;
END;
$$;
