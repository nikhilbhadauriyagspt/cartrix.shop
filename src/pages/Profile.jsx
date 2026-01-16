import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  User, 
  Lock, 
  ShoppingBag, 
  LogOut, 
  ChevronRight, 
  Package, 
  Calendar, 
  CreditCard, 
  Check, 
  AlertCircle,
  Settings,
  ShieldCheck,
  History,
  Sparkles,
  ArrowRight
} from 'lucide-react'

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
    document.title = 'Account - Modern Workspace'
    window.scrollTo(0, 0)
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
      return setError('Passwords do not match')
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
    const statusMap = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      processing: 'bg-blue-50 text-blue-600 border-blue-100',
      shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    }
    return statusMap[status] || 'bg-gray-50 text-gray-600 border-gray-100'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User, desc: 'Update details' },
    { id: 'orders', label: 'Orders', icon: History, desc: 'View history' },
    { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Password & more' },
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-orange selection:text-white pb-24">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Member Dashboard
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] animate-slide-up">
              Welcome, <br />
              <span className="text-gray-400 truncate max-w-full inline-block px-4">
                {profileData.fullName.split(' ')[0] || 'User'}.
              </span>
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* 2. Side Navigation */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-32 space-y-8">
              {/* User Identity Card */}
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-gray-100/50 text-center relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-[#F9FAFB] rounded-[2rem] flex items-center justify-center text-gray-400 text-3xl font-black mb-6 mx-auto border-4 border-white shadow-xl transition-transform duration-500 group-hover:scale-105">
                    {profileData.fullName?.charAt(0).toUpperCase() || <User />}
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-1 truncate">{profileData.fullName}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{profileData.email}</p>
                </div>
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/10 transition-colors"></div>
              </div>

              {/* Nav Menu */}
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full group flex items-center gap-5 px-8 py-5 rounded-[2rem] text-left transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-black text-white shadow-2xl shadow-black/10 translate-x-2'
                        : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeTab === item.id ? 'bg-brand-orange text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-white'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-black uppercase tracking-widest">{item.label}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                        activeTab === item.id ? 'text-gray-400' : 'text-gray-300'
                      }`}>{item.desc}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                      activeTab === item.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                    }`} />
                  </button>
                ))}
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-5 px-8 py-6 rounded-[2rem] text-left text-red-500 hover:bg-red-50 transition-all mt-6 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-white transition-colors">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Logout Account</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* 3. Main Content Area */}
          <main className="flex-1">
            <div className="bg-white rounded-[4rem] p-8 md:p-16 border border-gray-100 shadow-sm min-h-[700px] relative overflow-hidden">
              
              {/* Feedback Notifications */}
              <div className="absolute top-10 right-10 left-10 z-20 space-y-4 pointer-events-none">
                {error && (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-slide-up pointer-events-auto shadow-xl">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    {error}
                  </div>
                )}
                {updateSuccess && (
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-slide-up pointer-events-auto shadow-xl">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                      <Check className="w-4 h-4" />
                    </div>
                    {updateSuccess}
                  </div>
                )}
              </div>

              {/* Tab Content */}
              <div className="relative z-10">
                {activeTab === 'profile' && (
                  <div className="max-w-2xl animate-fade-in">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Personal Details</h2>
                        <p className="text-sm text-gray-500 font-medium">Keep your identity up to date.</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                          placeholder="email@example.com"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-12 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl shadow-gray-200 uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Save Profile'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                        <History className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h2>
                        <p className="text-sm text-gray-500 font-medium">Track your workspace investments.</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {orders.length > 0 ? (
                        orders.map((order, idx) => (
                          <div 
                            key={order.id} 
                            className="group bg-[#F9FAFB] rounded-[3rem] p-8 md:p-10 border border-gray-50 hover:bg-white hover:border-brand-orange/20 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 animate-slide-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                              <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-gray-100 flex items-center justify-center text-brand-orange shadow-sm group-hover:bg-brand-orange group-hover:text-white transition-all duration-500">
                                  <Package className="w-7 h-7" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Ref.</p>
                                  <p className="font-black text-gray-900 text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">${order.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-gray-200/50">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
                                <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ordered On</p>
                                <p className="text-xs font-black text-gray-600 flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment</p>
                                <p className="text-xs font-black text-gray-600 flex items-center gap-2">
                                  <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                                  {order.payment_method || 'Standard'}
                                </p>
                              </div>
                              <div className="flex items-end justify-end">
                                <Link 
                                  to={`/orders/${order.id}`}
                                  className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2"
                                >
                                  View Details <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-24 bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200">
                          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                          <h3 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-400 font-medium mb-10">Your next premium tool is just a few clicks away.</p>
                          <Link to="/shop" className="inline-flex px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-xl uppercase tracking-widest text-xs">
                            Browse Collection
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="max-w-2xl animate-fade-in">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Security Settings</h2>
                        <p className="text-sm text-gray-500 font-medium">Protect your workspace account.</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-12 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl shadow-gray-200 uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1 disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </main>

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
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
      `}</style>
    </div>
  )
}