import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useWebsite } from '../contexts/WebsiteContext'
import { supabase } from '../lib/supabase'
import { CreditCard, Lock, Banknote, Truck, ShieldCheck, MapPin, Package } from 'lucide-react'
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
    document.title = 'Checkout - Secure Payment'
    fetchPaymentMethods()
    if (user?.email) {
      setShippingInfo(prev => ({ ...prev, email: user.email }))
    }
  }, [user])

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order')
      setPaymentMethods(data || [])
      if (data && data.length > 0) setSelectedPaymentMethod(data[0].method_name)
    } catch (error) {
      console.error(error)
    }
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPaymentMethod) return alert('Please select a payment method')
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
        ...(user ? { user_id: user.id, is_guest: false } : {
          is_guest: true,
          guest_name: shippingInfo.fullName,
          guest_email: shippingInfo.email,
          guest_phone: shippingInfo.phone
        })
      }

      const { data: order, error: orderError } = await supabase.from('orders').insert([orderData]).select().single()
      if (orderError) throw orderError

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      if (isCOD) {
        await clearCart()
        navigate(`/order-success?orderId=${order.id}`)
        return
      }

      // Payment Gateway Logic
      const paymentData = await initiatePayment(order.id, total, selectedPaymentMethod)
      let verification = { verified: false }

      if (paymentData.gateway === 'razorpay') {
        const response = await processRazorpayPayment(paymentData, shippingInfo)
        verification = await verifyPayment(order.id, response.paymentId, response.signature, 'razorpay', response.orderId)
      } else if (paymentData.gateway === 'paypal') {
        const response = await processPayPalPayment(paymentData, shippingInfo)
        verification = await verifyPayment(order.id, response.paymentId, null, 'paypal')
      } else {
        alert('Payment gateway not configured.')
        return
      }

      if (verification.verified) {
        await clearCart()
        navigate(`/order-success?orderId=${order.id}`)
      } else {
        throw new Error('Payment verification failed')
      }

    } catch (error) {
      console.error(error)
      alert('Order processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    return requiredFields.every(field => shippingInfo[field] && shippingInfo[field].trim() !== '');
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Hero Header */}
      <div className="bg-[#F2F7F6] py-16 border-b border-[#e8f1f0]">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="flex justify-center mb-4">
            <Lock className="w-8 h-8 text-brand-orange" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Secure Checkout</h1>
          <p className="text-gray-500 mt-4 font-medium">Complete your purchase safely and securely.</p>
        </div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* LEFT COLUMN: Forms */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. Shipping Address */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">1</div>
                <h2 className="text-2xl font-bold">Shipping Information</h2>
              </div>
              
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Full Name</label>
                    <input type="text" name="fullName" required value={shippingInfo.fullName} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" placeholder="John Doe" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
                    <input type="email" name="email" required value={shippingInfo.email} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Phone Number</label>
                    <input type="tel" name="phone" required value={shippingInfo.phone} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Street Address</label>
                    <input type="text" name="address" required value={shippingInfo.address} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" placeholder="123 Main St, Apt 4B" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">City</label>
                    <input type="text" name="city" required value={shippingInfo.city} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">State / Province</label>
                    <input type="text" name="state" required value={shippingInfo.state} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">ZIP / Postal Code</label>
                    <input type="text" name="zipCode" required value={shippingInfo.zipCode} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Country</label>
                    <input type="text" name="country" required value={shippingInfo.country} onChange={handleInputChange} className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium" />
                  </div>
                </form>
              </div>
            </section>

            {/* 2. Payment Method */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">2</div>
                <h2 className="text-2xl font-bold">Payment Method</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-500 py-4">Loading options...</p>
                ) : (
                  paymentMethods.map((method) => (
                    <label 
                      key={method.id} 
                      className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPaymentMethod === method.method_name ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        value={method.method_name} 
                        checked={selectedPaymentMethod === method.method_name} 
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)} 
                        className="w-5 h-5 text-brand-orange focus:ring-brand-orange" 
                      />
                      <div className="flex items-center gap-3">
                        {method.method_type === 'cod' ? <Banknote className="w-6 h-6 text-gray-600" /> : <CreditCard className="w-6 h-6 text-gray-600" />}
                        <div>
                          <p className="font-bold text-gray-900">{method.method_name}</p>
                          {method.method_type === 'cod' && <p className="text-xs text-gray-500">Pay on delivery</p>}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#F9FAFB] rounded-[2.5rem] p-8 md:p-10 border border-gray-100 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>

              {/* Items */}
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-white rounded-xl p-2 border border-gray-100 flex-shrink-0">
                      <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.products.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">${(item.products.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600 flex items-center gap-1"><Truck className="w-4 h-4" /> Free</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 mt-4">
                  <span>Total</span>
                  <span className="text-brand-orange">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedPaymentMethod || !isFormValid()}
                className="w-full py-5 bg-black text-white font-bold rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> SSL Encrypted Payment
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}