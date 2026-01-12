import { Link, useLocation } from 'react-router-dom'
import {
  ShoppingCart, User, Menu, X, Search, LogIn, UserPlus, LogOut,
  Package, Shield, Percent, Truck, Headphones, ShieldCheck, Gift
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useAdmin } from '../hooks/useAdmin'
import { useState, useEffect, useRef } from 'react'
import SearchBar from './SearchBar'

const TopBar = () => {
  return (
    <div className="hidden md:block bg-gradient-to-r from-blue-700/95 via-indigo-700/95 to-blue-700/95 text-white text-sm py-2 shadow-sm">
      <div className=" w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left - Offer */}
          <div className="flex items-center gap-2.5 font-medium tracking-wide">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Percent size={18} />
            </div>
            <span>Flat <strong>15% OFF</strong> on First Order - Code: <strong>PRINT15</strong></span>
          </div>

          {/* Right - Benefits */}
          <div className="flex items-center gap-8 lg:gap-12 text-xs font-medium">
            <div className="flex items-center gap-2 group">
              <Truck size={16} className="group-hover:scale-110 transition-transform" />
              <span>Free Shipping Above ₹999</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Headphones size={16} className="group-hover:scale-110 transition-transform" />
              <span>24×7 Support</span>
            </div>
            <div className="flex items-center gap-2 group">
              <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
              <span>2 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 group  lg:flex">
              <Gift size={16} className="group-hover:scale-110 transition-transform" />
              <span>Free Gift on ₹5000+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const { user, signOut } = useAuth()
  const { getCartCount } = useCart()
  const { settings } = useSiteSettings()
  const { isAdmin } = useAdmin()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()

  const cartCount = getCartCount()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/shop', label: 'Shop' },

    { path: '/shop?category=Ink%2C%20Toner%20%26%20Paper', label: 'Inks & Toners' },
    { path: '/faq', label: 'Faq' },
    { path: '/contact', label: 'Contact' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <TopBar />

      <header className="
        bg-white/70 dark:bg-gray-950/70 
        backdrop-blur-xl 
        border-b border-gray-200/50 dark:border-gray-800/50
        sticky top-0 z-50 transition-all duration-300
      ">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              {settings.brand_logo ? (
                <img
                  src={settings.brand_logo}
                  alt={settings.brand_name || 'Brand'}
                  className="h-9 w-auto relative z-10"
                />
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity" />
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-blue-600 dark:text-blue-500 relative">
                      <path d="M17 10V8a5 5 0 0 0-10 0v2" />
                      <rect x="3" y="10" width="18" height="11" rx="2" />
                    </svg>
                  </div>
                  <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                    {settings.brand_name || 'Printer'}<span className="text-blue-600 dark:text-blue-500"></span>
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((item) => {
                const active = isActive(item.path)
                const special = item.isSpecial

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      group relative px-2 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium
                      ${active
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                      }
                      ${special ? 'animate-pulse-slow' : ''}
                    `}
                  >
                    {special && (
                      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 animate-pulse-slow transition-opacity duration-700 pointer-events-none" />
                    )}

                    <span className={`relative z-10 ${special ? 'text-orange-600 dark:text-orange-500 font-bold tracking-wide' : ''}`}>
                      {item.label}
                    </span>

                    <span className={`
                      absolute -bottom-1 left-0 h-[2.5px] rounded-full transition-all duration-500 ease-out
                      ${special ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 w-full animate-gradient-x' : 'bg-blue-600 dark:bg-blue-500'}
                      ${active || special ? 'w-full' : 'w-0 group-hover:w-full'}
                    `} />


                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative hidden md:block group">
                <div className="w-64 lg:w-80 xl:w-96">
                  <SearchBar
                    placeholder="Search printers, ink, toner..."
                    className="
                      w-full h-10 pl-11 pr-4
                      bg-white/60 dark:bg-gray-900/60
                      border border-gray-300/70 dark:border-gray-700/70
                      rounded-full text-sm
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
                      transition-all duration-300 group-hover:shadow-sm
                    "
                  />
                </div>
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
                {cartCount > 0 && (
                  <span className="
                    absolute -top-1 -right-1 min-w-[18px] h-5 px-1.5
                    flex items-center justify-center
                    bg-red-600 text-white text-[10px] font-bold
                    rounded-full border-2 border-white dark:border-gray-950
                    scale-100 hover:scale-110 transition-transform
                  ">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
                </button>

                {profileDropdownOpen && (
                  <div className="
                    absolute right-0 top-full mt-2 w-64 sm:w-72
                    bg-white dark:bg-gray-900
                    rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800
                    overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150
                  ">
                    {user ? (
                      <>
                        <div className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {user.email?.split('@')[0]}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Shield size={18} />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <User size={18} />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Package size={18} />
                            <span>My Orders</span>
                          </Link>
                          <hr className="my-1 border-gray-200 dark:border-gray-800" />
                          <button
                            onClick={() => { signOut(); setProfileDropdownOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-5 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <div className="text-center py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-white">Welcome!</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Login to save cart & track orders
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/login"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <LogIn size={18} />
                            <span>Sign In</span>
                          </Link>
                          <Link
                            to="/signup"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <UserPlus size={18} />
                            <span>Create Account</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 py-5">
              {/* Mobile Search */}
              <div className="mb-6">
                <SearchBar placeholder="Search products..." className="w-full" />
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {item.label}
                    {item.isSpecial && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded">
                        HOT
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Auth in Mobile */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                {user ? (
                  <div className="space-y-2">
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Shield size={20} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <User size={20} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Package size={20} />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={20} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-xl text-center border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-xl text-center bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Required animations - put in global CSS or tailwind.config */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes bounce-small {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-small { animation: bounce-small 2s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%; 
          animation: gradient-x 6s ease infinite; 
        }
      `}</style>
    </>
  )
}