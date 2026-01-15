import { Link, useLocation } from 'react-router-dom'
import {
  ShoppingCart, User, Menu, X, Heart, MapPin, Phone,
  Printer, Droplet, FileText, Settings, Layers, Wrench
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useAdmin } from '../hooks/useAdmin'
import { useState, useEffect, useRef } from 'react'
import SearchBar from './SearchBar'
import AnnouncementBar from './AnnouncementBar'
import { supabase } from '../lib/supabase'

// Helper function to generate URL-friendly slugs (matching Shop.jsx)
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export default function Header() {
  const { user, signOut } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const { settings } = useSiteSettings()
  const { isAdmin } = useAdmin()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const profileRef = useRef(null)
  const location = useLocation()

  const cartCount = getCartCount()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/Faq', label: 'faq' },
    { path: '/contact', label: 'Contact' },
  ]

  // Default fallback categories if DB fetch fails or is empty
  const defaultCategories = [
    { name: 'Printers', icon: Printer, slug: 'printers' },
    { name: 'Ink Cartridges', icon: Droplet, slug: 'ink-cartridges' },
    { name: 'Toner', icon: Layers, slug: 'toner' },
    { name: 'Paper', icon: FileText, slug: 'paper' },
    { name: 'Parts', icon: Settings, slug: 'parts' },
    { name: 'Services', icon: Wrench, slug: 'services' },
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

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug')
        .limit(6)

      if (error) {
        console.error('Error fetching categories:', error)
      } else if (data && data.length > 0) {
        // Map icons to fetched categories based on name matching or default
        const mappedCategories = data.map((cat, index) => ({
          ...cat,
          icon: defaultCategories[index % defaultCategories.length].icon
        }))
        setCategories(mappedCategories)
      } else {
        setCategories(defaultCategories)
      }
    } catch (err) {
      setCategories(defaultCategories)
    }
  }

  // Use state categories or fallback to default immediately if state is empty (during initial load)
  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200  font-sans">

        {/* ================= MAIN ROW ================= */}
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center h-20 gap-6">

            {/* 1. LOGO */}
            <Link to="/" className="flex-shrink-0 group">
              {settings.brand_logo ? (
                <img
                  src={settings.brand_logo}
                  alt={settings.brand_name || 'Brand'}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl tracking-tighter rounded-sm group-hover:bg-brand-orange transition-colors">
                    P
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase text-black">
                    {settings.brand_name || 'PRINTER'}<span className="text-brand-orange">.</span>
                  </span>
                </div>
              )}
            </Link>

            {/* 2. SEARCH BAR */}
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchBar
                placeholder="Search products..."
                className="shadow-none"
              />
            </div>

            {/* 3. SPACER */}
            <div className="hidden lg:block w-8 xl:w-16"></div>

            {/* 4. NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    text-sm font-bold uppercase tracking-wider py-1 px-3 rounded-md relative group overflow-hidden whitespace-nowrap
                    ${isActive(item.path) ? 'text-white bg-orange-500' : 'text-black hover:text-brand-orange'}
                    transition-colors duration-300
                  `}
                >
                  {item.label}
                  <span className={`
                    absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange transform origin-left transition-transform duration-300
                    ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `}></span>
                </Link>
              ))}
            </nav>

            {/* 5. RIGHT ICONS */}
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              {/* Wishlist (New) */}
              <Link
                to="/wishlist"
                className="hidden sm:flex p-2 text-black hover:text-brand-orange transition-colors relative group"
                title="Wishlist"
              >
                <Heart className="w-6 h-6" strokeWidth={1.5} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-brand-orange text-white text-[10px] font-bold rounded-full border border-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative group p-2 text-black hover:text-brand-orange transition-colors"
                title="Cart"
              >
                <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-brand-orange text-white text-[10px] font-bold rounded-full border border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 hover:text-brand-orange transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-brand-orange transition-colors">
                    <User className="w-5 h-5 text-black" />
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-4 w-64 bg-white text-black rounded-sm shadow-2xl border-t-4 border-brand-orange z-50 animate-in fade-in slide-in-from-top-2">
                    {user ? (
                      <>
                        <div className="px-6 py-4 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 uppercase mt-1">Logged In</p>
                        </div>
                        <div className="py-2">
                          {isAdmin && (
                            <Link to="/admin/dashboard" onClick={() => setProfileDropdownOpen(false)} className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Admin Dashboard</Link>
                          )}
                          <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">My Profile</Link>
                          <Link to="/orders" onClick={() => setProfileDropdownOpen(false)} className="block px-6 py-2 hover:bg-gray-50 text-sm font-medium">Orders</Link>
                          <button onClick={() => { signOut(); setProfileDropdownOpen(false) }} className="w-full text-left px-6 py-2 hover:bg-gray-50 text-sm font-medium text-red-600">Sign Out</button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 space-y-2">
                        <Link to="/login" onClick={() => setProfileDropdownOpen(false)} className="block w-full text-center py-2 bg-black text-white text-sm font-bold uppercase hover:bg-brand-orange">Sign In</Link>
                        <Link to="/signup" onClick={() => setProfileDropdownOpen(false)} className="block w-full text-center py-2 border border-black text-black text-sm font-bold uppercase hover:bg-black hover:text-white">Sign Up</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-black hover:text-brand-orange transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-full h-[calc(100vh-140px)] overflow-y-auto z-40 animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-1 rounded-full">
                <SearchBar placeholder="Search..." className="w-full shadow-none" />
              </div>

              <nav className="flex flex-col space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-4 py-3 text-lg font-bold uppercase tracking-wider border-l-2 transition-all
                      ${isActive(item.path)
                        ? 'border-brand-orange text-brand-orange bg-gray-50'
                        : 'border-transparent text-black hover:text-brand-orange hover:bg-gray-50'}
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-lg font-bold uppercase tracking-wider border-l-2 border-transparent text-black hover:text-brand-orange hover:bg-gray-50 flex items-center gap-2"
                >
                  Wishlist
                  <Heart className="w-4 h-4" />
                </Link>
              </nav>

              <div className="pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {displayCategories.slice(0, 6).map((cat, idx) => (
                    <Link
                      key={idx}
                      to={`/shop/category/${cat.slug || generateSlug(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-md hover:bg-brand-orange hover:text-white transition-colors text-center truncate"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Account</div>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-black hover:text-brand-orange font-medium">Profile</Link>
                    <button onClick={() => { signOut(); setMobileMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-red-500 font-medium">Sign Out</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center bg-black text-white font-bold uppercase hover:bg-brand-orange">Sign In</Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center border border-black text-black font-bold uppercase hover:bg-black hover:text-white">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="border-t pt-2 border-gray-100 bg-gray-50/50 hidden md:block">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 text-sm">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {displayCategories.map((cat, index) => {
                const Icon = cat.icon || Layers
                return (
                  <Link
                    key={index}
                    to={`/shop/category/${cat.slug || generateSlug(cat.name)}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-brand-orange font-medium whitespace-nowrap transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-brand-orange transition-colors" />
                    <span>{cat.name}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-6 pl-4 ml-4 flex-shrink-0">
              {settings.address && (
                <div className="flex items-center gap-3 text-gray-700 font-medium max-w-[260px]">
                  <div className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-full">
                    <MapPin className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div className='flex flex-col'>
                    <span>Address:</span>
                    <span className="truncate" title={settings.address}>{settings.address}</span>
                  </div>
                </div>
              )}

              {settings.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-3 text-gray-700 border-l pl-3 border-gray-200 hover:text-black transition font-medium"
                >
                  <div className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-full">
                    <Phone className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div className='flex flex-col'>
                    <span>Phone:</span>
                    <span>{settings.contact_phone}</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}