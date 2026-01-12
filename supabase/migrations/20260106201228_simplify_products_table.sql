/*
  # Simplify Products Table

  1. Changes
    - Add brand column to products table
    - Drop unnecessary columns while keeping essential ones
    - Keep: id, name, description, price, category_id, brand, image_url, images
    - Remove: slug, features, specifications, stock, rating, review_count, is_featured, 
              discount_price, printer_type, how_it_works, key_benefits, considerations, 
              who_should_buy, safety_tips, comparisons, is_active

  2. Notes
    - Data in removed columns will be lost
    - Keeping timestamps for audit purposes
    - image_url will serve as main image
    - images (jsonb) will serve as additional images
*/

-- Add brand column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products ADD COLUMN brand text;
  END IF;
END $$;

-- Drop unnecessary columns
ALTER TABLE products DROP COLUMN IF EXISTS slug;
ALTER TABLE products DROP COLUMN IF EXISTS features;
ALTER TABLE products DROP COLUMN IF EXISTS specifications;
ALTER TABLE products DROP COLUMN IF EXISTS stock;
ALTER TABLE products DROP COLUMN IF EXISTS rating;
ALTER TABLE products DROP COLUMN IF EXISTS review_count;
ALTER TABLE products DROP COLUMN IF EXISTS is_featured;
ALTER TABLE products DROP COLUMN IF EXISTS discount_price;
ALTER TABLE products DROP COLUMN IF EXISTS printer_type;
ALTER TABLE products DROP COLUMN IF EXISTS how_it_works;
ALTER TABLE products DROP COLUMN IF EXISTS key_benefits;
ALTER TABLE products DROP COLUMN IF EXISTS considerations;
ALTER TABLE products DROP COLUMN IF EXISTS who_should_buy;
ALTER TABLE products DROP COLUMN IF EXISTS safety_tips;
ALTER TABLE products DROP COLUMN IF EXISTS comparisons;
ALTER TABLE products DROP COLUMN IF EXISTS is_active;
