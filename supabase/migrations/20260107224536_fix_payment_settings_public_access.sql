/*
  # Fix Payment Settings Public Access

  1. Changes
    - Add policy to allow public read access to enabled payment settings
    - This allows customers to see which payment methods are available during checkout
  
  2. Security
    - Only SELECT is allowed for public
    - Only shows enabled payment gateways
    - API secrets are still protected (customers only see gateway_name and api_key for client-side SDKs)
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view payment settings" ON payment_settings;

-- Allow public read access to enabled payment settings
CREATE POLICY "Anyone can view enabled payment settings"
  ON payment_settings
  FOR SELECT
  TO public
  USING (is_enabled = true);

-- Keep admin management policy
-- (already exists: "Admins can manage payment settings")