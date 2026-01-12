import { supabase } from '../lib/supabase'

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const loadStripeScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const loadPayPalScript = (clientId) => {
  return new Promise((resolve) => {
    if (window.paypal) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=credit,card&intent=capture`
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    script.setAttribute('data-sdk-integration-source', 'button-factory')
    document.body.appendChild(script)
  })
}

export const initiatePayment = async (orderId, amount, paymentMethod) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'USD',
          paymentMethod,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Payment initiation failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment initiation error:', error)
    throw error
  }
}

export const verifyPayment = async (orderId, paymentId, signature, gateway, gatewayOrderId = null) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY

    const payload = {
      orderId,
      paymentId,
      signature,
      gateway,
    }

    if (gatewayOrderId) {
      payload.gatewayOrderId = gatewayOrderId
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      throw new Error('Payment verification failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment verification error:', error)
    throw error
  }
}

export const processRazorpayPayment = async (paymentData, shippingInfo) => {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK')
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.orderId,
      name: 'LaserProGuide',
      description: 'Product Purchase',
      prefill: {
        name: shippingInfo.fullName,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
      },
      theme: {
        color: '#3b82f6',
      },
      handler: async function (response) {
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'))
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  })
}

export const processStripePayment = async (paymentData, shippingInfo) => {
  const loaded = await loadStripeScript()
  if (!loaded) {
    throw new Error('Failed to load Stripe SDK')
  }

  const stripe = window.Stripe(paymentData.key)

  const { error } = await stripe.confirmCardPayment(paymentData.clientSecret, {
    payment_method: {
      card: {
        token: 'tok_visa',
      },
      billing_details: {
        name: shippingInfo.fullName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    paymentId: paymentData.paymentIntentId,
  }
}

export const processPayPalPayment = async (paymentData, shippingInfo) => {
  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('gateway_name', 'PayPal')
    .eq('is_enabled', true)
    .maybeSingle()

  if (!settings) {
    throw new Error('PayPal not configured')
  }

  const loaded = await loadPayPalScript(settings.api_key)
  if (!loaded) {
    throw new Error('Failed to load PayPal SDK')
  }

  return new Promise((resolve, reject) => {
    const backdrop = document.createElement('div')
    backdrop.style.position = 'fixed'
    backdrop.style.top = '0'
    backdrop.style.left = '0'
    backdrop.style.width = '100%'
    backdrop.style.height = '100%'
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    backdrop.style.zIndex = '9999'
    backdrop.style.display = 'flex'
    backdrop.style.alignItems = 'center'
    backdrop.style.justifyContent = 'center'

    const paypalContainer = document.createElement('div')
    paypalContainer.id = 'paypal-button-container'
    paypalContainer.style.backgroundColor = 'white'
    paypalContainer.style.padding = '30px'
    paypalContainer.style.borderRadius = '12px'
    paypalContainer.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)'
    paypalContainer.style.maxWidth = '400px'
    paypalContainer.style.width = '90%'

    const title = document.createElement('h3')
    title.textContent = 'Complete Payment with PayPal'
    title.style.marginBottom = '20px'
    title.style.fontSize = '18px'
    title.style.fontWeight = 'bold'
    title.style.textAlign = 'center'
    title.style.color = '#1f2937'

    const buttonWrapper = document.createElement('div')
    buttonWrapper.id = 'paypal-buttons-wrapper'

    const cancelButton = document.createElement('button')
    cancelButton.textContent = 'Cancel'
    cancelButton.style.marginTop = '15px'
    cancelButton.style.width = '100%'
    cancelButton.style.padding = '10px'
    cancelButton.style.backgroundColor = '#f3f4f6'
    cancelButton.style.border = 'none'
    cancelButton.style.borderRadius = '6px'
    cancelButton.style.fontSize = '14px'
    cancelButton.style.fontWeight = '500'
    cancelButton.style.color = '#374151'
    cancelButton.style.cursor = 'pointer'
    cancelButton.onclick = () => {
      cleanup()
      reject(new Error('Payment cancelled by user'))
    }

    paypalContainer.appendChild(title)
    paypalContainer.appendChild(buttonWrapper)
    paypalContainer.appendChild(cancelButton)
    backdrop.appendChild(paypalContainer)
    document.body.appendChild(backdrop)

    const cleanup = () => {
      if (document.body.contains(backdrop)) {
        document.body.removeChild(backdrop)
      }
    }

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 45
      },
      createOrder: () => {
        return paymentData.orderId
      },
      onApprove: async (data) => {
        try {
          cleanup()
          resolve({
            paymentId: data.orderID,
            orderId: data.orderID,
          })
        } catch (error) {
          cleanup()
          reject(error)
        }
      },
      onError: (err) => {
        cleanup()
        reject(new Error('PayPal payment failed'))
      },
      onCancel: () => {
        cleanup()
        reject(new Error('Payment cancelled by user'))
      },
    }).render('#paypal-buttons-wrapper')
  })
}
