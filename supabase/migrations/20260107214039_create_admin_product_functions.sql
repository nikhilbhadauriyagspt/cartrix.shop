/*
  # Create Admin Product Management Functions
  
  Creates serverside functions that admin panel can call to perform CRUD operations
  on products without being blocked by RLS policies.
  
  ## Functions Created
  - admin_manage_product: Insert, update, and delete products
  
  ## Security
  - Uses SECURITY DEFINER to bypass RLS
  - Functions run with elevated privileges
*/

-- Function for Product CRUD operations
CREATE OR REPLACE FUNCTION admin_manage_product(
  operation text,
  product_id uuid DEFAULT NULL,
  product_data jsonb DEFAULT NULL
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
      INSERT INTO products (
        name, 
        description, 
        price, 
        category_id, 
        brand, 
        image_url, 
        images
      )
      VALUES (
        (product_data->>'name')::text,
        (product_data->>'description')::text,
        COALESCE((product_data->>'price')::numeric, 0),
        (product_data->>'category_id')::uuid,
        (product_data->>'brand')::text,
        (product_data->>'image_url')::text,
        COALESCE((product_data->>'images')::jsonb, '[]'::jsonb)
      )
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(products.*))
      INTO result_data;
      
    WHEN 'update' THEN
      UPDATE products
      SET
        name = COALESCE((product_data->>'name')::text, name),
        description = COALESCE((product_data->>'description')::text, description),
        price = COALESCE((product_data->>'price')::numeric, price),
        category_id = COALESCE((product_data->>'category_id')::uuid, category_id),
        brand = COALESCE((product_data->>'brand')::text, brand),
        image_url = COALESCE((product_data->>'image_url')::text, image_url),
        images = COALESCE((product_data->>'images')::jsonb, images),
        updated_at = now()
      WHERE id = product_id
      RETURNING jsonb_build_object('success', true, 'data', row_to_json(products.*))
      INTO result_data;
      
    WHEN 'delete' THEN
      DELETE FROM products WHERE id = product_id;
      result_data = jsonb_build_object('success', true);
      
    ELSE
      result_data = jsonb_build_object('success', false, 'error', 'Invalid operation');
  END CASE;
  
  RETURN result_data;
END;
$$;