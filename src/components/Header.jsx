import { Link, useLocation } from 'react-router-dom'
import {
  ShoppingCart, User, Menu, X, Heart, Phone, Mail,
  ChevronDown, LogOut, LayoutDashboard,
  Facebook, Instagram, Linkedin, Twitter, MapPin
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

// Helper function to generate URL-friendly slugs
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
  const { getCartCount, setIsCartOpen } = useCart()
  const { wishlistItems } = useWishlist()
  const { settings } = useSiteSettings()
  const { isAdmin } = useAdmin()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const profileRef = useRef(null)
  const categoriesRef = useRef(null)
  const location = useLocation()

  const cartCount = getCartCount()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
    { path: '/faq', label: 'FAQs' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug')
        .limit(8)

      if (error) {
        console.error('Error fetching categories:', error)
      } else if (data) {
        setCategories(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <AnnouncementBar />

      <header className="font-sans w-full relative z-40">
        
        {/* === TOP BAR === */}
        <div className="bg-brand-orange text-white text-xs sm:text-sm py-2">
          <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-4 sm:gap-6">
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-medium">{settings.contact_phone}</span>
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-medium">{settings.contact_email}</span>
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-4">
               <span className="hidden md:inline opacity-80">Follow Us:</span>
               <div className="flex gap-3">
                 <a href="#" className="hover:text-black transition-colors"><Facebook className="w-3.5 h-3.5" /></a>
                 <a href="#" className="hover:text-black transition-colors"><Twitter className="w-3.5 h-3.5" /></a>
                 <a href="#" className="hover:text-black transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
                 <a href="#" className="hover:text-black transition-colors"><Linkedin className="w-3.5 h-3.5" /></a>
               </div>
            </div>
          </div>
        </div>

        {/* === MAIN HEADER === */}
        <div className="bg-white py-6 border-b border-gray-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between gap-4 lg:gap-12">
              
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                {settings.brand_logo ? (
                  <img
                    src={settings.brand_logo}
                    alt={settings.brand_name || 'Brand'}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div className="flex flex-col leading-none">
                    <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">
                      {settings.brand_name || 'PRINTER'}
                      <span className="text-brand-orange">.</span>
                    </span>
                  </div>
                )}
              </Link>

              {/* Search Bar (Hidden on Mobile) */}
              <div className="hidden lg:block flex-1 max-w-2xl">
                <SearchBar 
                  placeholder="Search for products, categories..." 
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
                
                {/* Wishlist */}
                <Link to="/wishlist" className="hidden sm:flex flex-col items-center group relative">
                  <div className="relative p-2">
                    <Heart className="w-6 h-6 text-gray-600 group-hover:text-brand-orange transition-colors" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-brand-orange transition-colors">Wishlist</span>
                </Link>

                {/* Cart */}
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="flex flex-col items-center group relative"
                >
                  <div className="relative p-2">
                    <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-brand-orange transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-[10px] uppercase font-bold text-gray-500 group-hover:text-brand-orange transition-colors">My Cart</span>
                </button>

                {/* Account */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="hidden sm:flex flex-col items-center group"
                  >
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-brand-orange group-hover:text-white transition-all">
                      <User className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-brand-orange transition-colors">
                        {user ? 'Account' : 'Login'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </button>

                   {/* Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                            <p className="text-xs text-brand-orange font-bold uppercase mt-0.5">Active Member</p>
                          </div>
                          
                          {isAdmin && (
                            <Link 
                              to="/admin/dashboard" 
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                            </Link>
                          )}
                          
                          <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link to="/orders" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                            <ShoppingCart className="w-4 h-4" /> My Orders
                          </Link>
                          
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button 
                              onClick={() => { signOut(); setProfileDropdownOpen(false) }} 
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 space-y-2">
                          <Link to="/login" onClick={() => setProfileDropdownOpen(false)} className="flex justify-center w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded hover:bg-brand-orange transition-colors">
                            Log In
                          </Link>
                          <Link to="/signup" onClick={() => setProfileDropdownOpen(false)} className="flex justify-center w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded hover:border-gray-900 hover:text-gray-900 transition-colors">
                            Create Account
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-900 hover:text-brand-orange transition-colors"
                >
                  <Menu className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === NAVIGATION BAR === */}
        <div className="bg-gray-900 text-white hidden lg:block sticky top-0 z-40 shadow-md">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-14">
              
              <div className="flex items-center h-full">
                {/* Categories Dropdown */}
                <div className="relative h-full" ref={categoriesRef}>
                  <button 
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className={`
                      flex items-center gap-3 h-full px-6 font-bold uppercase tracking-wider text-sm bg-brand-orange hover:bg-teal-700 transition-colors
                      ${categoriesOpen ? 'bg-teal-700' : ''}
                    `}
                  >
                    <Menu className="w-5 h-5" />
                    Browse Categories
                  </button>

                  {/* Dropdown Menu */}
                  {categoriesOpen && (
                    <div className="absolute top-full left-0 w-64 bg-white text-gray-900 shadow-2xl py-2 rounded-b-md border-t-2 border-brand-orange animate-in fade-in slide-in-from-top-2">
                      {categories.map((cat, idx) => (
                        <Link
                          key={idx}
                          to={`/shop/category/${cat.slug || generateSlug(cat.name)}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block px-6 py-3 text-sm font-medium hover:bg-gray-50 hover:text-brand-orange transition-colors border-b border-gray-50 last:border-0"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <Link 
                         to="/shop" 
                         onClick={() => setCategoriesOpen(false)}
                         className="block px-6 py-3 text-sm font-bold text-brand-orange hover:bg-gray-50 border-t border-gray-100"
                      >
                        View All Products &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                {/* Main Nav Links */}
                <nav className="flex items-center gap-8 ml-8">
                  {navLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        text-sm font-bold uppercase tracking-widest py-1 relative group
                        ${isActive(item.path) ? 'text-brand-orange' : 'text-gray-300 hover:text-white'}
                        transition-colors
                      `}
                    >
                      {item.label}
                      <span className={`
                        absolute -bottom-4 left-0 w-full h-1 bg-brand-orange transform transition-transform duration-300 origin-left
                        ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                      `}></span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right Side Promo */}
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>Store Location: <span className="text-white">Baton Rouge, LA</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* === MOBILE MENU OVERLAY === */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 bg-gray-900 text-white flex items-center justify-between">
              <span className="font-black text-xl tracking-tighter uppercase">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4">
              
              {/* Mobile Search */}
              <div className="px-5 mb-6">
                <SearchBar placeholder="Search products..." className="w-full shadow-sm" />
              </div>

              {/* Links */}
              <nav className="flex flex-col">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-6 py-4 text-sm font-bold uppercase tracking-widest border-l-4 transition-all
                      ${isActive(item.path)
                        ? 'border-brand-orange text-brand-orange bg-teal-50'
                        : 'border-transparent text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-gray-100 my-4"></div>

              {/* Categories Section */}
              <div className="px-6">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
                 <div className="space-y-1">
                   {categories.map((cat, idx) => (
                     <Link
                        key={idx}
                        to={`/shop/category/${cat.slug || generateSlug(cat.name)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-sm font-medium text-gray-600 hover:text-brand-orange transition-colors"
                     >
                       {cat.name}
                     </Link>
                   ))}
                   <Link 
                     to="/shop"
                     onClick={() => setMobileMenuOpen(false)}
                     className="block py-2 text-sm font-bold text-brand-orange mt-2"
                   >
                     View All Products
                   </Link>
                 </div>
              </div>
            </div>

            {/* Drawer Footer (User) */}
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold">
                       {user.email[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-xs text-gray-500 hover:text-brand-orange">View Profile</Link>
                    </div>
                  </div>
                  <button 
                    onClick={() => { signOut(); setMobileMenuOpen(false) }}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-bold text-sm uppercase rounded hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-center bg-gray-900 text-white font-bold text-sm uppercase rounded hover:bg-gray-800">Log In</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-center border border-gray-300 text-gray-900 font-bold text-sm uppercase rounded hover:bg-gray-100">Sign Up</Link>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}