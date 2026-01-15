import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import {
  Search,
  Filter,
  Grid,
  List,
  ShoppingCart,
  Star,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Heart
} from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../contexts/ToastContext'
import { useWebsite } from '../contexts/WebsiteContext'

// Helper function to generate URL-friendly slugs
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export default function Shop() {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAvailability, setSelectedAvailability] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState([0, 2000]) // [min, max]
  const [maxPriceLimit, setMaxPriceLimit] = useState(2000) // Dynamic max based on DB

  // UI States
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isInitialCategoryLoadComplete, setIsInitialCategoryLoadComplete] = useState(false)
  const [addedProducts, setAddedProducts] = useState(new Set())
  
  // Accordion States (Category open by default)
  const [openSections, setOpenSections] = useState({
    category: true,
    price: false,
    availability: false
  })

  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()
  const { websiteId } = useWebsite()

  useEffect(() => {
    document.title = 'Shop - Premium Printers & Accessories'
    const searchParam = searchParams.get('search')
    if (searchParam) setSearchQuery(searchParam)
  }, [searchParams])

  useEffect(() => {
    const initData = async () => {
      if (!websiteId) return

      // Parallel fetch for categories and max price
      const [cats, maxPrice] = await Promise.all([
        fetchCategories(),
        fetchMaxPrice()
      ])

      setMaxPriceLimit(maxPrice)
      setPriceRange([0, maxPrice])

      if (categorySlug && cats.length > 0) {
        const matchingCategory = cats.find(
          (cat) => generateSlug(cat.name) === categorySlug
        )
        if (matchingCategory) {
          setSelectedCategory(matchingCategory.id)
        } else {
          setSelectedCategory('all')
        }
      } else {
        setSelectedCategory('all')
      }
      setIsInitialCategoryLoadComplete(true)
    }

    initData()
  }, [websiteId, categorySlug])

  useEffect(() => {
    if (websiteId && isInitialCategoryLoadComplete) {
      const debounceFetch = setTimeout(() => {
        fetchProducts()
      }, 300) // Debounce for slider
      return () => clearTimeout(debounceFetch)
    }
  }, [selectedCategory, priceRange, selectedAvailability, sortBy, searchQuery, websiteId, isInitialCategoryLoadComplete])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, slug, products(id)')
        .order('name')

      if (error) throw error

      // Filter: Only keep categories that have at least 1 product
      const validCategories = (data || [])
        .map(cat => ({
          ...cat,
          productCount: cat.products?.length || 0
        }))
        .filter(cat => cat.productCount > 0)

      setCategories(validCategories)
      return validCategories
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  const fetchMaxPrice = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('price')
        .order('price', { ascending: false })
        .limit(1)
      
      if (data && data.length > 0) {
        return Math.ceil(data[0].price)
      }
      return 2000
    } catch (error) {
      return 2000
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*, categories(*)')

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }
      
      // Price Range Filter
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1])

      // Availability
      if (selectedAvailability === 'in-stock') {
        query = query.gt('stock', 0) 
      } else if (selectedAvailability === 'out-of-stock') {
        query = query.eq('stock', 0)
      }

      // Sort
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      
      if (error && error.code === '42703') {
         // Fallback if stock column missing
         const { data: retryData } = await supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false })
         setProducts(retryData || [])
      } else {
         setProducts(data || [])
      }

    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(product.id, 1)
      addToast(`${product.name} added to cart!`, 'success')
      setAddedProducts((prev) => new Set(prev).add(product.id))
      setTimeout(() => {
        setAddedProducts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleCategoryChange = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    const preservedParams = new URLSearchParams();
    if (searchParams.get('search')) {
      preservedParams.set('search', searchParams.get('search'));
    }
    const queryString = preservedParams.toString();
    const finalQueryString = queryString ? `?${queryString}` : '';

    let newPath;
    if (categoryId !== 'all' && categoryName) {
      newPath = `/shop/category/${generateSlug(categoryName)}${finalQueryString}`;
    } else {
      newPath = `/shop${finalQueryString}`;
    }
    navigate(newPath);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handlePriceChange = (e) => {
    setPriceRange([0, parseInt(e.target.value)])
  }

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, maxPriceLimit]);
    setSelectedAvailability('all');
    setSortBy('featured');
    setSearchQuery('');
    navigate('/shop');
  }

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[1] !== maxPriceLimit || selectedAvailability !== 'all' || searchQuery !== ''

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      
      {/* 1. Hero */}
      <section className="bg-[#F2F7F6] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-4 block animate-fade-in">
              Catalog
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
              Explore Our <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-600">Collection</span>
            </h1>
            
            <div className="mt-8 relative max-w-xl">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-14 pr-6 py-5 rounded-full bg-white border-2 border-transparent focus:border-brand-orange focus:ring-0 shadow-lg text-lg outline-none transition-all placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* 2. Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" /> Filters
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs font-bold text-red-500 uppercase tracking-wider hover:underline">
                    Reset
                  </button>
                )}
              </div>

              {/* Categories - Accordion (Open by Default) */}
              <div className="border-b border-gray-100 py-4">
                <button 
                  onClick={() => toggleSection('category')}
                  className="flex items-center justify-between w-full text-left mb-2 group"
                >
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors">Categories</h4>
                  {openSections.category ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                
                {openSections.category && (
                  <div className="space-y-3 mt-4 animate-fade-in">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCategory === 'all' ? 'border-brand-orange' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {selectedCategory === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />}
                      </div>
                      <input
                        type="radio"
                        name="category"
                        className="hidden"
                        checked={selectedCategory === 'all'}
                        onChange={() => handleCategoryChange('all', null)}
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>All Products</span>
                    </label>

                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCategory === cat.id ? 'border-brand-orange' : 'border-gray-300 group-hover:border-gray-400'}`}>
                          {selectedCategory === cat.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />}
                        </div>
                        <input
                          type="radio"
                          name="category"
                          className="hidden"
                          checked={selectedCategory === cat.id}
                          onChange={() => handleCategoryChange(cat.id, cat.name)}
                        />
                        <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {cat.name} <span className="text-xs text-gray-400 ml-1">({cat.productCount})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range - Accordion (Closed by Default) + Slider */}
              <div className="border-b border-gray-100 py-4">
                <button 
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left mb-2 group"
                >
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors">Price Range</h4>
                  {openSections.price ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {openSections.price && (
                  <div className="mt-6 mb-2 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-500">$0</span>
                      <span className="text-sm font-bold text-brand-orange">${priceRange[1]}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={maxPriceLimit} 
                      step="10" 
                      value={priceRange[1]} 
                      onChange={handlePriceChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    />
                  </div>
                )}
              </div>

              {/* Availability - Accordion (Closed by Default) */}
              <div className="border-b border-gray-100 py-4">
                <button 
                  onClick={() => toggleSection('availability')}
                  className="flex items-center justify-between w-full text-left mb-2 group"
                >
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors">Availability</h4>
                  {openSections.availability ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {openSections.availability && (
                  <div className="space-y-3 mt-4 animate-fade-in">
                    {['all', 'in-stock', 'out-of-stock'].map((status) => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedAvailability === status ? 'border-brand-orange bg-brand-orange' : 'border-gray-300 group-hover:border-gray-400'}`}>
                          {selectedAvailability === status && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input
                          type="radio"
                          name="availability"
                          className="hidden"
                          value={status}
                          checked={selectedAvailability === status}
                          onChange={(e) => setSelectedAvailability(e.target.value)}
                        />
                        <span className={`text-sm font-medium capitalize transition-colors ${selectedAvailability === status ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {status.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* 3. Product Grid Area */}
          <div className="flex-1">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
              <p className="text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{products.length}</span> results
              </p>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 border border-transparent focus:bg-white focus:border-gray-200 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <option value="featured">Recommended</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden p-2.5 bg-black text-white rounded-xl hover:bg-brand-orange transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-[2.5rem] h-[400px] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-[#F9FAFB] rounded-[3rem]">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                <button onClick={clearFilters} className="mt-6 text-brand-orange font-bold hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-6'}>
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className={`group bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 relative border border-gray-100/50 hover:border-gray-100 ${viewMode === 'list' ? 'flex gap-8 items-center' : 'flex flex-col'}`}
                  >
                    <div className={`relative bg-gray-50 overflow-hidden ${viewMode === 'list' ? 'w-64 h-64 rounded-[2rem] flex-shrink-0' : 'aspect-square rounded-[2rem] w-full mb-5'}`}>
                      <img
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply opacity-95 transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Floating Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isInWishlist(product.id)) {
                              removeFromWishlist(product.id);
                              addToast('Removed from wishlist', 'success');
                            } else {
                              addToWishlist(product.id);
                              addToast('Added to wishlist', 'success');
                            }
                          }}
                          className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-colors ${isInWishlist(product.id) ? 'text-brand-orange' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        >
                          <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Quick Add (Grid Only) */}
                      {viewMode === 'grid' && (
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all duration-300 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
                            addedProducts.has(product.id) ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-brand-orange'
                          }`}
                        >
                          {addedProducts.has(product.id) ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                          {addedProducts.has(product.id) ? 'Added' : 'Add to Cart'}
                        </button>
                      )}
                    </div>

                    <div className="px-2 pb-2 flex-1 flex flex-col">
                      <div className="mb-auto">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{product.categories?.name || 'Item'}</p>
                        <h3 className={`font-bold text-gray-900 leading-snug group-hover:text-brand-orange transition-colors ${viewMode === 'list' ? 'text-2xl mb-4' : 'text-lg mb-2 line-clamp-2 min-h-[50px]'}`}>
                          {product.name}
                        </h3>
                        {viewMode === 'list' && (
                          <p className="text-gray-500 mb-6 max-w-xl">{product.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-2">
                        <div className="flex flex-col">
                          <span className={`font-black text-gray-900 ${viewMode === 'list' ? 'text-3xl' : 'text-xl'}`}>${parseFloat(product.price).toFixed(2)}</span>
                          {viewMode === 'list' && <span className="text-xs text-green-600 font-bold mt-1">In Stock & Ready to Ship</span>}
                        </div>
                        
                        {viewMode === 'grid' ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-gray-400">4.8</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-3 ${
                              addedProducts.has(product.id) ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-brand-orange'
                            }`}
                          >
                            {addedProducts.has(product.id) ? 'In Cart' : 'Add to Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-8 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile filter content */}
            <div className="space-y-8">
              {/* Category */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Categories</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="radio" name="mobile-cat" checked={selectedCategory === 'all'} onChange={() => handleCategoryChange('all', null)} className="w-5 h-5 text-brand-orange focus:ring-brand-orange" />
                    <span>All Products</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3">
                      <input type="radio" name="mobile-cat" checked={selectedCategory === cat.id} onChange={() => handleCategoryChange(cat.id, cat.name)} className="w-5 h-5 text-brand-orange focus:ring-brand-orange" />
                      <span>{cat.name} ({cat.productCount})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Slider Mobile */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Price Range</h4>
                <div className="mb-2 flex justify-between font-bold text-gray-900">
                  <span>$0</span>
                  <span className="text-brand-orange">${priceRange[1]}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={maxPriceLimit} 
                  step="10" 
                  value={priceRange[1]} 
                  onChange={handlePriceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Availability</h4>
                <div className="space-y-3">
                  {['all', 'in-stock', 'out-of-stock'].map((status) => (
                    <label key={status} className="flex items-center gap-3">
                      <input type="radio" name="mobile-stock" checked={selectedAvailability === status} onChange={(e) => setSelectedAvailability(e.target.value)} value={status} className="w-5 h-5 text-brand-orange focus:ring-brand-orange" />
                      <span className="capitalize">{status.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-4 bg-brand-orange text-white font-bold rounded-xl shadow-lg mt-8"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}