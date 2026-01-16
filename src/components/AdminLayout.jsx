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
  Bell,
  ChevronRight
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
    { name: 'Brand Setup', path: '/admin/brand', icon: Palette },
    { name: 'Inventory', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Content/FAQ', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Policies', path: '/admin/policies', icon: FileText },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Finance', path: '/admin/payments', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-brand-orange selection:text-white">
      {/* Modern Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-[50]">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tight hidden sm:block uppercase tracking-widest">{settings.brand_name} <span className="text-brand-orange">HUB</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WebsiteSelector />
            
            <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

            <div className="relative">
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors relative group"
              >
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-50 z-[60] overflow-hidden animate-slide-up">
                  <div className="px-8 py-6 bg-gray-50 border-b border-gray-50 flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Notifications</h4>
                    <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Clear</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="px-8 py-12 text-center">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">No new alerts</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          to="/admin/orders"
                          onClick={() => setShowNotificationDropdown(false)}
                          className="block px-8 py-5 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                        >
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">New Order</p>
                              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">${notif.amount} • Just now</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-100">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{admin?.name || 'Admin'}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{admin?.email?.split('@')[0]}</p>
              </div>
              <button
                onClick={logout}
                className="p-3 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        {/* Modern Sidebar Navigation */}
        <aside className={`lg:w-72 flex-shrink-0 ${sidebarOpen ? 'fixed inset-0 z-[100] bg-white p-6' : 'hidden lg:block'}`}>
          <div className="lg:sticky lg:top-32 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${isActive(item.path)
                  ? 'bg-black text-white shadow-xl shadow-black/10 translate-x-2'
                  : 'text-gray-500 hover:bg-white hover:text-black hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive(item.path) ? 'bg-brand-orange text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-white'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                {isActive(item.path) && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
              </Link>
            ))}
            
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full mt-10 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
              >
                Close Menu
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
