import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import AdminLayout from '../../components/AdminLayout'
import {
  Package,
  FileText,
  ShoppingCart,
  DollarSign,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react'

export default function AdminDashboard() {
  const { websiteId } = useWebsite()
  const [stats, setStats] = useState({
    products: 0,
    blogs: 0,
    orders: 0,
    revenue: 0,
    users: 0,
    inquiries: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (websiteId) {
      fetchDashboardData()
    }
  }, [websiteId])

  const fetchDashboardData = async () => {
    if (!websiteId || websiteId === 'undefined') return;
    
    try {
      const [
        productsRes,
        blogsRes,
        ordersRes,
        usersRes,
        inquiriesRes,
        recentOrdersRes,
        recentUsersRes
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('website_id', websiteId),
        supabase.from('user_website_registrations').select('*', { count: 'exact', head: true }).eq('website_id', websiteId),
        supabase.rpc('admin_get_contact_submissions', { target_website_id: websiteId }),
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('website_id', websiteId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.rpc('admin_get_users_by_website', { target_website_id: websiteId })
      ])

      const revenue = ordersRes.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

      setStats({
        products: productsRes.count || 0,
        blogs: blogsRes.count || 0,
        orders: ordersRes.data?.length || 0,
        revenue: revenue,
        users: usersRes.count || 0,
        inquiries: inquiriesRes.data?.length || 0,
      })

      setRecentOrders(recentOrdersRes.data || [])
      setRecentUsers(recentUsersRes.data?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2-b-2 border-2-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <TrendingUp className="w-3 h-3" />
            Performance Overview
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Dashboard <span className="text-gray-400">Hub.</span>
          </h2>
          <p className="text-gray-500 font-medium mt-2">Everything you need to manage your business effectively.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Main Stat: Revenue */}
          <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Total Revenue</p>
              <h3 className="text-5xl font-black tracking-tighter mb-8">${stats.revenue.toLocaleString()}</h3>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" /> +12.5% Growth
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl group-hover:bg-brand-orange/30 transition-colors"></div>
            <DollarSign className="absolute bottom-10 right-10 w-24 h-24 text-white/5" />
          </div>

          {/* Orders Stat */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Active Orders</p>
              <h3 className="text-5xl font-black tracking-tighter mb-8 text-gray-900">{stats.orders}</h3>
              <Link to="/admin/orders" className="inline-flex items-center gap-2 text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors">
                Manage Orders <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ShoppingCart className="absolute bottom-10 right-10 w-24 h-24 text-gray-50 group-hover:text-brand-orange/5 transition-colors" />
          </div>

          {/* Users Stat */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Total Customers</p>
              <h3 className="text-5xl font-black tracking-tighter mb-8 text-gray-900">{stats.users}</h3>
              <Link to="/admin/users" className="inline-flex items-center gap-2 text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors">
                View All Users <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <Users className="absolute bottom-10 right-10 w-24 h-24 text-gray-50 group-hover:text-brand-orange/5 transition-colors" />
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* Recent Orders */}
          <div className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Orders</h3>
              <Link to="/admin/orders" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors">View All</Link>
            </div>
            
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No recent orders found</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-[2rem] hover:bg-white border border-transparent hover:border-gray-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-brand-orange shadow-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mt-1 border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">New Customers</h3>
              <Link to="/admin/users" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors">View All</Link>
            </div>
            
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No recent customers found</p>
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-[2rem] hover:bg-white border border-transparent hover:border-gray-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm font-black text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate">{user.email.split('@')[0]}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Joined</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {[
            { label: 'Products', count: stats.products, icon: Package, link: '/admin/products' },
            { label: 'Blog Posts', count: stats.blogs, icon: FileText, link: '/admin/blogs' },
            { label: 'Inquiries', count: stats.inquiries, icon: MessageSquare, link: '/admin/inquiries' },
          ].map((item, i) => (
            <Link key={i} to={item.link} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 flex items-center justify-between hover:shadow-xl transition-all duration-500 group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-orange/5 group-hover:text-brand-orange transition-all">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 tracking-tighter">{item.count}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-brand-orange transition-all" />
            </Link>
          ))}
        </div>

      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `}</style>
    </AdminLayout>
  )
}
