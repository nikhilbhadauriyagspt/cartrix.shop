/*
  # Add Update Order Payment Function

  1. New Functions
    - `update_order_payment_status` - Allows edge functions to update order payment status
      - Takes order_id, payment_id, gateway name
      - Updates payment status to 'completed'
      - Bypasses RLS using SECURITY DEFINER
  
  2. Security
    - Function runs with elevated privileges (SECURITY DEFINER)
    - Only updates specific payment-related fields
    - No authentication required (called from edge function with service key)
*/

-- Create function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status(
  p_order_id uuid,
  p_payment_id text,
  p_gateway text
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  -- Update the order
  UPDATE orders
  SET 
    payment_status = 'completed',
    payment_transaction_id = p_payment_id,
    payment_gateway = p_gateway,
    updated_at = now()
  WHERE id = p_order_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Order payment status updated'
  );
END;
$$;