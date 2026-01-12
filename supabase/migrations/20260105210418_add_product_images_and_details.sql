/*
  # Add Product Images and Additional Details

  1. New Columns
    - `images` (jsonb) - Array of image URLs for product gallery
    - `discount_price` (numeric) - Discounted price if applicable
    - `printer_type` (text) - Type of printer (laser, inkjet, etc.)
    - `how_it_works` (text) - Detailed description of how the printer works
    - `key_benefits` (jsonb) - Array of key benefits
    - `considerations` (jsonb) - Array of considerations/limitations
    - `who_should_buy` (jsonb) - Array of target audience descriptions
    - `safety_tips` (jsonb) - Safety and maintenance tips
    - `comparisons` (jsonb) - How it compares to other products
    
  2. Changes
    - Add support for multiple product images
    - Add fields for detailed product information pages
*/

-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS printer_type text DEFAULT 'laser';
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS key_benefits jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS considerations jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS who_should_buy jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS safety_tips jsonb DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS comparisons jsonb DEFAULT '[]'::jsonb;

-- Update existing products to include image_url in images array if not already there
UPDATE products 
SET images = jsonb_build_array(image_url)
WHERE images = '[]'::jsonb AND image_url IS NOT NULL AND image_url != '';