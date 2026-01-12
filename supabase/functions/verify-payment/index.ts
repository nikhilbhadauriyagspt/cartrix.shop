import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface VerifyRequest {
  orderId: string;
  paymentId: string;
  signature?: string;
  gateway: string;
  gatewayOrderId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId, paymentId, signature, gateway, gatewayOrderId }: VerifyRequest = await req.json();

    if (!orderId || !paymentId || !gateway) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let gatewayName = 'Razorpay';
    if (gateway === 'stripe') gatewayName = 'Stripe';
    if (gateway === 'paypal') gatewayName = 'PayPal';

    const { data: settings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('gateway_name', gatewayName)
      .eq('is_enabled', true)
      .maybeSingle();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let isValid = false;

    if (gateway === 'razorpay' && signature) {
      const razorpayOrderId = gatewayOrderId || orderId;
      const text = razorpayOrderId + '|' + paymentId;
      const generatedSignature = createHmac('sha256', settings.api_secret)
        .update(text)
        .digest('hex');
      isValid = generatedSignature === signature;
    } else if (gateway === 'stripe') {
      const stripeResponse = await fetch(
        `https://api.stripe.com/v1/payment_intents/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + settings.api_secret,
          },
        }
      );

      if (stripeResponse.ok) {
        const paymentIntent = await stripeResponse.json();
        isValid = paymentIntent.status === 'succeeded';
      }
    } else if (gateway === 'paypal') {
      const paypalBaseUrl = settings.is_test_mode
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

      const paypalAuthResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(settings.api_key + ':' + settings.api_secret),
        },
        body: 'grant_type=client_credentials',
      });

      if (paypalAuthResponse.ok) {
        const authData = await paypalAuthResponse.json();
        const accessToken = authData.access_token;

        const captureResponse = await fetch(
          `${paypalBaseUrl}/v2/checkout/orders/${paymentId}/capture`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + accessToken,
            },
          }
        );

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          isValid = captureData.status === 'COMPLETED';
        } else {
          const paypalResponse = await fetch(
            `${paypalBaseUrl}/v2/checkout/orders/${paymentId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
              },
            }
          );

          if (paypalResponse.ok) {
            const paypalOrder = await paypalResponse.json();
            isValid = paypalOrder.status === 'COMPLETED' || paypalOrder.status === 'APPROVED';
          }
        }
      }
    }

    if (isValid) {
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_order_payment_status', {
          p_order_id: orderId,
          p_payment_id: paymentId,
          p_gateway: gateway,
        });

      if (updateError || !updateResult?.success) {
        throw new Error(updateResult?.error || 'Failed to update order');
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          message: 'Payment verified successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Payment verification failed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Payment verification failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});