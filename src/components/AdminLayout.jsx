import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import WebsiteSelector from './WebsiteSelector'
import {
  LayoutDashboard,
  Package,
  Tag,
  HelpCircle,
  FileText,
  ShoppingBag,
  Users,
  MessageSquare,
  CreditCard,
  Palette,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth()
  const { settings } = useSiteSettings()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    <div className="min-h-screen bg-slate-50">
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
