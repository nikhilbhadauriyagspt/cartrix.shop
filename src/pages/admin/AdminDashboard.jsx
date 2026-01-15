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
  Clock
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (websiteId) {
      fetchDashboardData()
    }
  }, [websiteId])

  const fetchDashboardData = async () => {
    try {
      const [
        productsRes,
        blogsRes,
        ordersRes,
        usersRes,
        inquiriesRes,
        recentOrdersRes
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('website_id', websiteId),
        supabase.rpc('admin_get_users_by_website', { target_website_id: websiteId }),
        supabase.rpc('admin_get_contact_submissions', { target_website_id: websiteId }),
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('website_id', websiteId)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      const revenue = ordersRes.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

      setStats({
        products: productsRes.count || 0,
        blogs: blogsRes.count || 0,
        orders: ordersRes.data?.length || 0,
        revenue: revenue,
        users: usersRes.data?.length || 0,
        inquiries: inquiriesRes.data?.length || 0,
      })

      setRecentOrders(recentOrdersRes.data || [])
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
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-3xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-bold">Total Products</p>
                <p className="text-4xl font-bold mt-2">{stats.products}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-bold">Total Orders</p>
                <p className="text-4xl font-bold mt-2">{stats.orders}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-bold">Total Revenue</p>
                <p className="text-4xl font-bold mt-2">${stats.revenue.toFixed(0)}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border-2 border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">Registered Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.users}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border-2 border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">Customer Inquiries</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.inquiries}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border-2 border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">Blog Posts</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.blogs}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="text-sm text-primary-600 hover:text-primary-700 font-bold"
              >
                View All
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-500 mt-1">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid gap-4">
              <Link
                to="/admin/products"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl hover:from-sky-100 hover:to-cyan-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Manage Products</h4>
                  <p className="text-sm text-slate-600">Add, edit, or remove products</p>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl hover:from-emerald-100 hover:to-green-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Manage Orders</h4>
                  <p className="text-sm text-slate-600">View and update order status</p>
                </div>
              </Link>

              <Link
                to="/admin/blogs"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Manage Blogs</h4>
                  <p className="text-sm text-slate-600">Create and publish blog posts</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
