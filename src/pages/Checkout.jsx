import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useWebsite } from '../contexts/WebsiteContext'
import { supabase } from '../lib/supabase'
import { 
  CreditCard, 
  Lock, 
  Banknote, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Package, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Info
} from 'lucide-react'
import { initiatePayment, verifyPayment, processRazorpayPayment, processPayPalPayment } from '../utils/paymentGateway'
import { formatImageUrl } from '../utils/formatUrl'

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
    window.scrollTo(0, 0)
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
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-orange selection:text-white pb-20">
      
      {/* 1. Header Navigation */}
      <div className="py-8 border-b border-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="text-black">Cart</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-orange bg-brand-orange/5 px-3 py-1 rounded-full">Checkout</span>
            <ChevronRight className="w-3 h-3" />
            <span>Success</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-12 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <Lock className="w-3 h-3" />
              Secure Checkout
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] animate-slide-up">
              Complete Your <br />
              <span className="text-gray-400">Order.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT COLUMN: Shipping & Payment */}
          <div className="flex-1 space-y-12">
            
            {/* 1. Shipping Information */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg shadow-xl">1</div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shipping Details</h2>
                  <p className="text-sm text-gray-500 font-medium">Where should we send your package?</p>
                </div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                    <input type="text" name="fullName" required value={shippingInfo.fullName} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="John Doe" />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                    <input type="email" name="email" required value={shippingInfo.email} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                    <input type="tel" name="phone" required value={shippingInfo.phone} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Street Address</label>
                    <input type="text" name="address" required value={shippingInfo.address} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="123 Main St, Apt 4B" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">City</label>
                    <input type="text" name="city" required value={shippingInfo.city} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="San Francisco" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">State / Province</label>
                    <input type="text" name="state" required value={shippingInfo.state} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="California" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">ZIP / Postal Code</label>
                    <input type="text" name="zipCode" required value={shippingInfo.zipCode} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="94103" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Country</label>
                    <input type="text" name="country" required value={shippingInfo.country} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="United States" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg shadow-xl">2</div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Method</h2>
                  <p className="text-sm text-gray-500 font-medium">Select your preferred way to pay.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.length === 0 ? (
                  <div className="md:col-span-2 py-12 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-brand-orange mb-4"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Payment Options</p>
                  </div>
                ) : (
                  paymentMethods.map((method) => (
                    <label 
                      key={method.id} 
                      className={`relative flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                        selectedPaymentMethod === method.method_name 
                        ? 'border-brand-orange bg-brand-orange/[0.02] shadow-xl shadow-brand-orange/5' 
                        : 'border-gray-50 bg-white hover:border-gray-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPaymentMethod === method.method_name ? 'border-brand-orange bg-brand-orange' : 'border-gray-200'
                      }`}>
                        {selectedPaymentMethod === method.method_name && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        value={method.method_name} 
                        checked={selectedPaymentMethod === method.method_name} 
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)} 
                        className="hidden" 
                      />
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          selectedPaymentMethod === method.method_name ? 'bg-brand-orange/10 text-brand-orange' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {method.method_type === 'cod' ? <Banknote className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 tracking-tight">{method.method_name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {method.method_type === 'cod' ? 'Pay on Delivery' : 'Secure Online Payment'}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary Sidebar */}
          <div className="lg:w-[450px] flex-shrink-0">
            <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 sticky top-32 shadow-2xl shadow-gray-100/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Summary</h2>
                <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {cartItems.length} Items
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-20 h-20 bg-[#F9FAFB] rounded-2xl p-3 border border-gray-50 flex-shrink-0 overflow-hidden">
                      <img 
                        src={formatImageUrl(item.products.image_url)} 
                        alt={item.products.name} 
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-brand-orange transition-colors">{item.products.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                        <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">${parseFloat(item.products.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="font-black text-gray-900 text-sm">
                      ${(item.products.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="font-black text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Shipping</span>
                  <span className="text-sm font-black text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                    <Truck className="w-3.5 h-3.5" /> FREE
                  </span>
                </div>
                <div className="h-px bg-gray-50 my-6"></div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-black text-gray-900 tracking-tight">Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">${total.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedPaymentMethod || !isFormValid()}
                className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex items-center justify-center gap-3 transform hover:-translate-y-1 ${
                  loading || !selectedPaymentMethod || !isFormValid()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-black text-white hover:bg-brand-orange shadow-brand-orange/20'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Complete Order
                  </>
                )}
              </button>

              <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-brand-orange flex-shrink-0" />
                  <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase tracking-wider">
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 grayscale opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  )
}