import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
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

    const { orderId, amount, currency = 'USD', paymentMethod }: PaymentRequest = await req.json();

    if (!orderId || !amount || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (paymentMethod === 'Cash on Delivery') {
      return new Response(
        JSON.stringify({
          success: true,
          paymentMethod: 'cod',
          message: 'Cash on Delivery order created successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: settings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('is_enabled', true)
      .maybeSingle();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'No payment gateway configured' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let paymentResponse;

    if (settings.gateway_name === 'Razorpay') {
      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(settings.api_key + ':' + settings.api_secret),
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: currency,
          receipt: orderId,
        }),
      });

      if (!razorpayResponse.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const razorpayData = await razorpayResponse.json();
      paymentResponse = {
        gateway: 'razorpay',
        orderId: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        key: settings.api_key,
      };
    } else if (settings.gateway_name === 'Stripe') {
      const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + settings.api_secret,
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(),
          currency: currency.toLowerCase(),
          metadata: JSON.stringify({ orderId }),
        }).toString(),
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create Stripe payment intent');
      }

      const stripeData = await stripeResponse.json();
      paymentResponse = {
        gateway: 'stripe',
        clientSecret: stripeData.client_secret,
        paymentIntentId: stripeData.id,
        amount: stripeData.amount,
        currency: stripeData.currency,
      };
    } else if (settings.gateway_name === 'PayPal') {
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

      if (!paypalAuthResponse.ok) {
        const errorText = await paypalAuthResponse.text();
        throw new Error(`Failed to authenticate with PayPal: ${errorText}`);
      }

      const authData = await paypalAuthResponse.json();
      const accessToken = authData.access_token;

      const paypalResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: orderId,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          }],
        }),
      });

      if (!paypalResponse.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const paypalData = await paypalResponse.json();
      paymentResponse = {
        gateway: 'paypal',
        orderId: paypalData.id,
        amount: amount,
        currency: currency,
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported payment gateway' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...paymentResponse,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Payment processing failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});