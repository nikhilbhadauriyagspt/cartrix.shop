/*
  # Enhance Guides Table with Rich Content Fields

  1. New Columns
    - `guide_type` (text) - Type of guide (Buying Guide, Comparison, Technical, etc.)
    - `icon_name` (text) - Lucide icon name for the guide card
    - `read_time` (integer) - Estimated reading time in minutes
    - `color_scheme` (text) - Color scheme for the card (blue, purple, green, etc.)
    - `guide_number` (integer) - Sequential guide number for display
    - `faqs` (jsonb) - Array of FAQ objects with question and answer
    - `key_takeaways` (jsonb) - Array of key takeaway strings
    - `sections` (jsonb) - Rich content sections with headings and content
    
  2. Changes
    - Add new fields to support the comprehensive guide format
    - Keep existing fields for backward compatibility
*/

-- Add new columns to guides table
ALTER TABLE guides ADD COLUMN IF NOT EXISTS guide_type text DEFAULT 'Guide';
ALTER TABLE guides ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'book-open';
ALTER TABLE guides ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 5;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS color_scheme text DEFAULT 'blue';
ALTER TABLE guides ADD COLUMN IF NOT EXISTS guide_number integer;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS key_takeaways jsonb DEFAULT '[]'::jsonb;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS sections jsonb DEFAULT '[]'::jsonb;
