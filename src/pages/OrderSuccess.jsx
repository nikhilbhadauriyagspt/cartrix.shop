import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShoppingBag, 
  Package, 
  Truck, 
  Sparkles,
  ClipboardList
} from 'lucide-react'

export default function OrderSuccess() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  useEffect(() => {
    document.title = 'Order Success - Modern Workspace'
    window.scrollTo(0, 0)

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()

      if (error) throw error
      setOrder(data)

      if (data?.is_guest) {
        setAccountData(prev => ({
          ...prev,
          email: data.guest_email,
          name: data.guest_name
        }))
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()

    if (accountData.password !== accountData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (accountData.password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    setCreatingAccount(true)

    try {
      await signUp(accountData.email, accountData.password)

      if (order) {
        await supabase.rpc('convert_guest_order_to_user', {
          p_order_id: order.id,
          p_user_id: user.id
        })
      }

      alert('Account created successfully! You can now track your orders.')
      navigate('/orders')
    } catch (error) {
      console.error('Error creating account:', error)
      alert(error.message || 'Failed to create account')
    } finally {
      setCreatingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-brand-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-orange selection:text-white pb-24">
      
      {/* 1. Celebratory Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-[#F9FAFB] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="w-24 h-24 bg-brand-orange text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-orange/20 mb-10 animate-slide-up">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Purchase Complete
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] animate-slide-up">
              Thank You <br />
              <span className="text-gray-400">For Your Order.</span>
            </h1>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      <div className="max-w-[800px] mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {/* Order Brief */}
          {order && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gray-50 rounded-[2rem] mb-12">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                <p className="font-black text-gray-900 truncate">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                <p className="font-black text-brand-orange">${parseFloat(order.total_amount).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</p>
                <p className="font-black text-gray-900 truncate">{order.payment_method}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                <p className="font-black text-green-600 capitalize">{order.status}</p>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">What's Next?</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              We've sent a confirmation email to <span className="text-black font-bold">{order?.guest_email || user?.email}</span>. 
              Our team is already preparing your workspace essentials for shipment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group hover:border-brand-orange/20 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-brand-orange/5 transition-colors">
                <Package className="w-6 h-6 text-gray-400 group-hover:text-brand-orange transition-colors" />
              </div>
              <h3 className="font-black text-gray-900 mb-2">Preparing</h3>
              <p className="text-xs text-gray-500 font-medium">Your items are being carefully picked and packed.</p>
            </div>
            <div className="p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group hover:border-brand-orange/20 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-brand-orange/5 transition-colors">
                <Truck className="w-6 h-6 text-gray-400 group-hover:text-brand-orange transition-colors" />
              </div>
              <h3 className="font-black text-gray-900 mb-2">Shipping</h3>
              <p className="text-xs text-gray-500 font-medium">You'll receive a tracking number as soon as it leaves.</p>
            </div>
          </div>

          {/* Account Creation (Only for Guests) */}
          {!user && order?.is_guest && !showAccountForm && (
            <div className="bg-black rounded-[2.5rem] p-10 text-center relative overflow-hidden mb-12">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Track Your Workspace.</h3>
                <p className="text-gray-400 font-medium mb-8 text-sm">
                  Create an account to track your orders in real-time and access exclusive early releases.
                </p>
                <button
                  onClick={() => setShowAccountForm(true)}
                  className="px-10 py-5 bg-brand-orange text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all duration-500 shadow-xl uppercase tracking-widest text-xs flex items-center gap-3 mx-auto"
                >
                  Create Your Account <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {/* Decorative circle */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl"></div>
            </div>
          )}

          {/* Account Form */}
          {!user && showAccountForm && (
            <div className="bg-[#F9FAFB] rounded-[2.5rem] p-8 md:p-10 mb-12 animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Register Account</h3>
                <button onClick={() => setShowAccountForm(false)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                  Cancel
                </button>
              </div>
              
              <form onSubmit={handleCreateAccount} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={accountData.name}
                        onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                        required
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={accountData.email}
                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={accountData.password}
                        onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                        required
                        minLength={6}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                        required
                        minLength={6}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="w-full py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-xl shadow-gray-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                >
                  {creatingAccount ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Confirm & Create Account
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/shop"
              className="flex-1 px-8 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              <ShoppingBag className="w-5 h-5" />
              Keep Shopping
            </Link>
            {user && (
              <Link
                to="/orders"
                className="flex-1 px-8 py-5 bg-white text-black border-2 border-gray-100 font-black rounded-2xl hover:border-black transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-3 transform hover:-translate-y-1"
              >
                <ClipboardList className="w-5 h-5" />
                View My Orders
              </Link>
            )}
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
      `}</style>
    </div>
  )
}
