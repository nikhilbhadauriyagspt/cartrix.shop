/*
  # Add stock field to products table

  ## Changes Made

  ### 1. Products Table
  - Add `stock` column (integer, default 100)
  - Add `is_featured` column (boolean, default false)
  - Add `discount_price` column (numeric, nullable)

  ## Notes
  - Stock defaults to 100 for existing products
  - is_featured is used to highlight products on homepage
  - discount_price enables sale pricing
*/

-- Add stock field to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_price numeric(10, 2);

-- Update existing products to have stock
UPDATE public.products SET stock = 100 WHERE stock IS NULL;
