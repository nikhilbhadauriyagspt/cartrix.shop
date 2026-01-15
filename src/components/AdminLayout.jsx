import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useWebsite } from '../contexts/WebsiteContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import WebsiteSelector from './WebsiteSelector'
import {
  LayoutDashboard,
  Package,
  Tag,
  HelpCircle,
  FileText,
  ShoppingBag,
  ShoppingCart,
  Users,
  MessageSquare,
  CreditCard,
  Palette,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth()
  const { settings } = useSiteSettings()
  const { websiteId } = useWebsite()
  const { addToast } = useToast()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  useEffect(() => {
    if (!websiteId) return

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `website_id=eq.${websiteId}`
        },
        (payload) => {
          const newOrder = payload.new
          setNotifications(prev => [
            { id: newOrder.id, amount: newOrder.total_amount, time: new Date() },
            ...prev
          ])
          
          addToast(`NEW ORDER RECEIVED!\nOrder ID: #${newOrder.id.slice(0, 8)}\nAmount: $${newOrder.total_amount}`, 'success', {
            duration: 0, // Sticky
            position: 'center'
          })
          
          try {
            const audio = new Audio('/notification.mp3')
            audio.play()
          } catch (e) {}
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [websiteId])

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Brand Settings', path: '/admin/brand', icon: Palette },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Policies', path: '/admin/policies', icon: FileText },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-bold">{settings.brand_name} Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <WebsiteSelector />
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors relative group"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">Notifications</h4>
                      <button onClick={() => setNotifications([])} className="text-xs font-bold text-red-500 uppercase hover:underline">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm font-medium">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to="/admin/orders"
                            onClick={() => setShowNotificationDropdown(false)}
                            className="block px-6 py-4 hover:bg-slate-50 border-b border-slate-50 transition-colors"
                          >
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">New Order Received</p>
                                <p className="text-xs text-slate-500 mt-0.5">Amount: <span className="font-bold text-slate-900">${notif.amount}</span></p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Just now</p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <Link to="/admin/orders" onClick={() => setShowNotificationDropdown(false)} className="block py-3 text-center text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors uppercase tracking-widest">View All Orders</Link>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{admin?.name || 'Admin'}</div>
                  <div className="text-slate-400 text-xs">{admin?.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <aside className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <nav className="bg-white rounded-xl shadow-md p-3 space-y-1 sticky top-8">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <main className="lg:col-span-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
