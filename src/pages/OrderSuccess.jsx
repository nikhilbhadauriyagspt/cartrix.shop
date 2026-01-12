import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CheckCircle, Mail, Lock, User, ArrowRight, ShoppingBag } from 'lucide-react'

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
    document.title = 'Order Success - Thank You!'

    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('description', 'Order successfully placed! Thank you for your purchase. Check your email for order confirmation and tracking details.')
    setMetaTag('keywords', 'order success, order confirmation, thank you, purchase complete, order placed')

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">
              Thank you for your order. We've received your order and will process it shortly.
            </p>
          </div>

          {order && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-bold text-gray-900">{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-bold text-gray-900">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold text-green-600 capitalize">{order.status}</span>
                </div>
              </div>
            </div>
          )}

          {!user && order?.is_guest && !showAccountForm && (
            <div className="bg-primary-50 border-2-2 border-2-primary-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-primary-900 mb-2">Create an Account to Track Your Order</h3>
              <p className="text-primary-700 text-sm mb-4">
                Create an account to easily track your orders, save your addresses, and enjoy a faster checkout experience next time.
              </p>
              <button
                onClick={() => setShowAccountForm(true)}
                className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-2xl font-bold hover:from-primary-700 hover:to-primary-600 transition flex items-center gap-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!user && showAccountForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Create Your Account</h3>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </div>
                  </label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </div>
                  </label>
                  <input
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creatingAccount}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-2xl font-bold hover:from-primary-700 hover:to-primary-600 transition disabled:opacity-50"
                  >
                    {creatingAccount ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAccountForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-300 transition"
                  >
                    Skip
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/shop"
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-primary-700 hover:to-primary-600 transition text-center flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
            {user && (
              <Link
                to="/orders"
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-bold hover:bg-gray-300 transition text-center"
              >
                View Orders
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
