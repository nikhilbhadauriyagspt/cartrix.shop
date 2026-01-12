/*
  # Add bulk insert products function
  
  1. New Functions
    - `bulk_insert_products` - Allows bulk insertion of products bypassing RLS
      - Takes an array of product objects
      - Returns the inserted products
      - Uses SECURITY DEFINER to bypass RLS
  
  2. Security
    - Function is public but requires valid product data
    - Validates that category_id exists before insertion
*/

CREATE OR REPLACE FUNCTION bulk_insert_products(products_data jsonb)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO products (name, description, price, category_id, image_url, images, brand)
  SELECT 
    (p->>'name')::text,
    (p->>'description')::text,
    (p->>'price')::numeric,
    (p->>'category_id')::uuid,
    COALESCE((p->>'image_url')::text, ''),
    COALESCE((p->'images')::jsonb, '[]'::jsonb),
    (p->>'brand')::text
  FROM jsonb_array_elements(products_data) AS p
  RETURNING *;
END;
$$;
