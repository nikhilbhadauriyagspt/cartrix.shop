import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Lock, Save, AlertCircle, CheckCircle, ShoppingBag, LogOut, ChevronRight } from 'lucide-react'

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
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  const navItems = [
    { id: 'profile', label: 'Profile Details', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white  rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {profileData.fullName?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900 ">{profileData.fullName}</h2>
                <p className="text-sm text-gray-500 ">{profileData.email}</p>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === item.id
                      ? 'bg-primary-50  text-primary-700 '
                      : 'text-gray-600  hover:bg-gray-100 '
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-grow">{item.label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors text-red-600  hover:bg-red-50 "
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <div className="bg-white  rounded-2xl shadow-lg p-6 sm:p-8">
              {error && (
                <div className="bg-red-50  border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-700 ">{error}</p>
                  </div>
                </div>
              )}
              {updateSuccess && (
                <div className="bg-green-50  border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 ">{updateSuccess}</p>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-6">Personal Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700  mb-1">Full Name</label>
                      <input type="text" id="fullName" required value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} className="w-full px-4 py-2 bg-gray-50  border-gray-300  rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700  mb-1">Email Address</label>
                      <input type="email" id="email" required value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full px-4 py-2 bg-gray-50  border-gray-300  rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-6">My Orders</h2>
                  <div className="space-y-4">
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <div key={order.id} className="p-4 border border-gray-200  rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-gray-800 ">Order #{order.id.slice(0, 8)}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                          <p className="text-sm text-gray-500 ">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-sm font-bold text-gray-700  mt-1">Total: ${order.total_amount.toFixed(2)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 ">You have no orders yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700  mb-1">New Password</label>
                      <input type="password" id="newPassword" required minLength={6} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-2 bg-gray-50  border-gray-300  rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700  mb-1">Confirm New Password</label>
                      <input type="password" id="confirmPassword" required minLength={6} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2 bg-gray-50  border-gray-300  rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
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
