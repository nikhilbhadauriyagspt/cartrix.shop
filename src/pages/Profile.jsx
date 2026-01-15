import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Lock, ShoppingBag, LogOut, ChevronRight, Package, Calendar, CreditCard, Check, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [orders, setOrders] = useState([])

  useEffect(() => {
    document.title = 'My Profile - Account Settings'
    if (!user) {
      navigate('/login')
      return
    }

    setProfileData({
      fullName: user.user_metadata?.full_name || '',
      email: user.email || '',
    })
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setUpdateSuccess('')
    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: profileData.email,
        data: { full_name: profileData.fullName },
      })
      if (updateError) throw updateError
      setUpdateSuccess('Profile updated successfully!')
      setTimeout(() => setUpdateSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setUpdateSuccess('')
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('New passwords do not match')
    }
    if (passwordData.newPassword.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })
      if (updateError) throw updateError
      setUpdateSuccess('Password updated successfully!')
      setPasswordData({ newPassword: '', confirmPassword: '' })
      setTimeout(() => setUpdateSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  const navItems = [
    { id: 'profile', label: 'My Details', icon: User },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'security', label: 'Login & Security', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Header */}
      <div className="bg-[#F2F7F6] py-16 border-b border-[#e8f1f0]">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">My Account</h1>
          <p className="text-gray-500 mt-4 font-medium text-lg">Manage your profile and view your orders.</p>
        </div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            {/* User Card */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-[#F9FAFB] rounded-full flex items-center justify-center text-gray-400 text-3xl font-black mb-6 mx-auto border-4 border-white shadow-lg">
                {profileData.fullName?.charAt(0).toUpperCase() || <User />}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{profileData.fullName}</h2>
              <p className="text-sm text-gray-500 truncate">{profileData.email}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left text-sm font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-grow uppercase tracking-wider">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left text-sm font-bold transition-all text-red-500 hover:bg-red-50 mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="uppercase tracking-wider">Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm min-h-[600px]">
              
              {/* Feedback Messages */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
              {updateSuccess && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-bold flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  {updateSuccess}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-black text-gray-900 mb-8">Personal Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-10 py-4 bg-brand-orange text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-4 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-8">Order History</h2>
                  <div className="space-y-6">
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <div key={order.id} className="group p-6 rounded-[2rem] border border-gray-100 hover:border-brand-orange/30 hover:shadow-lg transition-all duration-300 bg-[#F9FAFB] hover:bg-white">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-brand-orange">
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-gray-900">${order.total_amount.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200/60">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <CreditCard className="w-4 h-4" />
                              {order.payment_method || 'Payment'}
                            </div>
                            <div className="col-span-2 md:col-span-1 text-right">
                              <button className="text-sm font-bold text-brand-orange hover:underline">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-[2rem]">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No orders found</h3>
                        <p className="text-gray-500 mt-2">Looks like you haven't placed any orders yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-black text-gray-900 mb-8">Login & Security</h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        required
                        minLength={6}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        required
                        minLength={6}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-10 py-4 bg-brand-orange text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-4 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}