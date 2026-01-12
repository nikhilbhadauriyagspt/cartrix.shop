import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useWebsite } from '../contexts/WebsiteContext'
import { supabase } from '../lib/supabase'
import { CreditCard, Lock, Banknote, Truck } from 'lucide-react'
import { initiatePayment, verifyPayment, processRazorpayPayment, processPayPalPayment } from '../utils/paymentGateway'

export default function Checkout() {
  const { user } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { websiteId } = useWebsite()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })

  const subtotal = getCartTotal()
  const shipping = 0
  const total = subtotal + shipping

  useEffect(() => {
    document.title = 'Checkout - Complete Your Order'

    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('description', 'Complete your purchase securely. Enter your shipping information and choose your preferred payment method.')
    setMetaTag('keywords', 'checkout, secure payment, order completion, shipping information, payment methods, buy printers')

    fetchPaymentMethods()

    if (user?.email) {
      setShippingInfo(prev => ({ ...prev, email: user.email }))
    }
  }, [user])

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order')

      if (error) throw error
      setPaymentMethods(data || [])
      if (data && data.length > 0) {
        setSelectedPaymentMethod(data[0].method_name)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }

    setLoading(true)

    try {
      const selectedMethod = paymentMethods.find(m => m.method_name === selectedPaymentMethod)
      const isCOD = selectedMethod?.method_type === 'cod'

      const orderData = {
        total_amount: total,
        status: 'pending',
        payment_method: selectedPaymentMethod,
        payment_status: 'pending',
        shipping_address: shippingInfo,
        website_id: websiteId,
      }

      if (user) {
        orderData.user_id = user.id
        orderData.is_guest = false
      } else {
        orderData.is_guest = true
        orderData.guest_name = shippingInfo.fullName
        orderData.guest_email = shippingInfo.email
        orderData.guest_phone = shippingInfo.phone
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      if (isCOD) {
        await clearCart()
        navigate(`/order-success?orderId=${order.id}`)
        return
      }

      const paymentData = await initiatePayment(
        order.id,
        total,
        selectedPaymentMethod
      )

      if (paymentData.gateway === 'razorpay') {
        const razorpayResponse = await processRazorpayPayment(paymentData, shippingInfo)

        const verification = await verifyPayment(
          order.id,
          razorpayResponse.paymentId,
          razorpayResponse.signature,
          'razorpay',
          razorpayResponse.orderId
        )

        if (verification.verified) {
          await clearCart()
          navigate(`/order-success?orderId=${order.id}`)
        } else {
          throw new Error('Payment verification failed')
        }
      } else if (paymentData.gateway === 'paypal') {
        const paypalResponse = await processPayPalPayment(paymentData, shippingInfo)

        const verification = await verifyPayment(
          order.id,
          paypalResponse.paymentId,
          null,
          'paypal'
        )

        if (verification.verified) {
          await clearCart()
          navigate(`/order-success?orderId=${order.id}`)
        } else {
          throw new Error('Payment verification failed')
        }
      } else if (paymentData.gateway === 'stripe') {
        alert('Stripe payment requires card integration. Please use Cash on Delivery, Razorpay, or PayPal.')
        setLoading(false)
        return
      }

    } catch (error) {
      console.error('Error processing order:', error)
      alert(error.message || 'Failed to process order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Shipping Address</h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition"
                  />
                </div>
              </form>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-medium text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Loading payment options...</p>
                ) : (
                  paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === method.method_name
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.method_name}
                        checked={selectedPaymentMethod === method.method_name}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-primary-600"
                      />
                      <div className="flex items-center gap-4 flex-1">
                        {method.method_type === 'cod' ? (
                          <Banknote className="w-6 h-6 text-green-600" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-gray-700" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{method.method_name}</p>
                          {method.method_type === 'cod' && (
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Secure Badge */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  Your payment information is encrypted and secure
                </p>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !selectedPaymentMethod}
                className="w-full mt-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Processing Order...' : `Place Order – $${total.toFixed(2)}`}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.products.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(item.products.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Shipping
                  </span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 500 && shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Add ${(500 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-2xl font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
