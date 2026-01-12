/*
  # Add Product Reference to Guides

  1. Changes
    - Add `product_id` column to guides table
    - Add foreign key constraint to products table
    - This allows guides to be linked to specific products
    
  2. Notes
    - Product ID is optional (nullable) so guides can be general or product-specific
*/

-- Add product_id column to guides table
ALTER TABLE guides ADD COLUMN IF NOT EXISTS product_id uuid;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'guides_product_id_fkey'
  ) THEN
    ALTER TABLE guides 
    ADD CONSTRAINT guides_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES products(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
