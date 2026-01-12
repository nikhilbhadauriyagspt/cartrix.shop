/*
  # Create Admin Helper Functions

  ## Functions Created
  
  1. admin_manage_category - Create/Update/Delete categories
  2. admin_manage_product - Create/Update/Delete products
  3. admin_get_all_users - Get all registered users
  4. admin_get_all_inquiries - Get all contact submissions
  5. bulk_insert_products - Bulk insert products from CSV
  
  ## Security
  - All functions use SECURITY DEFINER
  - All functions check admin authentication
  - Set proper search_path to prevent SQL injection
*/

-- Function: Manage Categories
CREATE OR REPLACE FUNCTION admin_manage_category(
  p_action text,
  p_category_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
  new_category_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  CASE p_action
    WHEN 'create' THEN
      INSERT INTO categories (name, description)
      VALUES (p_name, p_description)
      RETURNING id INTO new_category_id;
      result := jsonb_build_object('success', true, 'id', new_category_id);

    WHEN 'update' THEN
      UPDATE categories
      SET name = COALESCE(p_name, name),
          description = COALESCE(p_description, description)
      WHERE id = p_category_id;
      result := jsonb_build_object('success', true, 'id', p_category_id);

    WHEN 'delete' THEN
      DELETE FROM categories WHERE id = p_category_id;
      result := jsonb_build_object('success', true, 'id', p_category_id);

    ELSE
      result := jsonb_build_object('success', false, 'error', 'Invalid action');
  END CASE;

  RETURN result;
END;
$$;

-- Function: Manage Products
CREATE OR REPLACE FUNCTION admin_manage_product(
  p_action text,
  p_product_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_price decimal DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_stock integer DEFAULT NULL,
  p_is_featured boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
  new_product_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  CASE p_action
    WHEN 'create' THEN
      INSERT INTO products (name, description, price, category_id, image_url, stock, is_featured)
      VALUES (p_name, p_description, p_price, p_category_id, p_image_url, COALESCE(p_stock, 0), COALESCE(p_is_featured, false))
      RETURNING id INTO new_product_id;
      result := jsonb_build_object('success', true, 'id', new_product_id);

    WHEN 'update' THEN
      UPDATE products
      SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        price = COALESCE(p_price, price),
        category_id = COALESCE(p_category_id, category_id),
        image_url = COALESCE(p_image_url, image_url),
        stock = COALESCE(p_stock, stock),
        is_featured = COALESCE(p_is_featured, is_featured),
        updated_at = now()
      WHERE id = p_product_id;
      result := jsonb_build_object('success', true, 'id', p_product_id);

    WHEN 'delete' THEN
      DELETE FROM products WHERE id = p_product_id;
      result := jsonb_build_object('success', true, 'id', p_product_id);

    ELSE
      result := jsonb_build_object('success', false, 'error', 'Invalid action');
  END CASE;

  RETURN result;
END;
$$;

-- Function: Get All Users
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE(
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Function: Get All Contact Submissions
CREATE OR REPLACE FUNCTION admin_get_all_inquiries()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.message,
    c.created_at
  FROM contact_submissions c
  ORDER BY c.created_at DESC;
END;
$$;

-- Function: Bulk Insert Products
CREATE OR REPLACE FUNCTION bulk_insert_products(products_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
  inserted_count integer := 0;
  failed_count integer := 0;
  product_record jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  FOR product_record IN SELECT * FROM jsonb_array_elements(products_data)
  LOOP
    BEGIN
      INSERT INTO products (
        name,
        description,
        price,
        category_id,
        image_url,
        stock,
        is_featured
      ) VALUES (
        (product_record->>'name')::text,
        (product_record->>'description')::text,
        (product_record->>'price')::decimal,
        (product_record->>'category_id')::uuid,
        (product_record->>'image_url')::text,
        COALESCE((product_record->>'stock')::integer, 0),
        COALESCE((product_record->>'is_featured')::boolean, false)
      );
      inserted_count := inserted_count + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
    END;
  END LOOP;

  result := jsonb_build_object(
    'success', true,
    'inserted', inserted_count,
    'failed', failed_count
  );

  RETURN result;
END;
$$;