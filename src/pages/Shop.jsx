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
  Heart,
  Sparkles,
  ArrowRight,
  ArrowUpDown,
  Eye,
  Minus,
  Plus
} from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../contexts/ToastContext'
import { useWebsite } from '../contexts/WebsiteContext'
import { formatImageUrl } from '../utils/formatUrl'

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
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [quickViewQuantity, setQuickViewQuantity] = useState(1)

  // Accordion States (Category open by default)
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    availability: false
  })

  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()
  const { websiteId } = useWebsite()

  useEffect(() => {
    document.title = 'Shop - Modern Workspace'
    const searchParam = searchParams.get('search')
    if (searchParam) setSearchQuery(searchParam)
    window.scrollTo(0, 0)
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

  const handleAddToCart = async (product, e, qty = 1) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    try {
      await addToCart(product.id, qty)
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

  const openQuickView = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewProduct(product)
    setQuickViewQuantity(1)
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
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-brand-orange selection:text-white">

      {/* 1. Soft Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Product Catalog
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] animate-slide-up">
              Discover the <br />
              <span className="text-gray-400">Perfect Tools.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* 2. Soft Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-10">
            <div className="sticky top-32 space-y-10">

              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-gray-900">
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors">
                    Reset All
                  </button>
                )}
              </div>

              {/* Search Filter */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Search</h4>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all', null)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === 'all'
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id, cat.name)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat.id
                        ? 'bg-brand-orange text-white shadow-lg'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Price Range</h4>
                  <span className="text-sm font-black text-brand-orange">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="10"
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
              </div>

              {/* Availability */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Availability</h4>
                <div className="space-y-3">
                  {['all', 'in-stock', 'out-of-stock'].map((status) => (
                    <label key={status} className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedAvailability === status
                        ? 'border-brand-orange bg-brand-orange text-white'
                        : 'border-gray-100 bg-gray-50 group-hover:border-gray-200'
                        }`}>
                        {selectedAvailability === status && <Check className="w-4 h-4" />}
                      </div>
                      <input
                        type="radio"
                        name="availability"
                        className="hidden"
                        value={status}
                        checked={selectedAvailability === status}
                        onChange={(e) => setSelectedAvailability(e.target.value)}
                      />
                      <span className={`text-sm font-bold capitalize transition-colors ${selectedAvailability === status ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                        {status.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* 3. Products Area */}
          <div className="flex-1 space-y-12">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-5 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {products.length} Items Found
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-12 pr-10 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border-none focus:bg-white focus:ring-4 focus:ring-brand-orange/5 outline-none cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-[3rem] h-[450px] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 rounded-[4rem]">
                <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No items match your criteria</h3>
                <p className="text-gray-500 font-medium mb-8">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-brand-orange transition-all shadow-xl">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10' : 'space-y-8'}>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`group bg-white transition-all duration-700 relative ${viewMode === 'list'
                      ? 'flex flex-col md:flex-row gap-10 items-center border border-gray-100 p-8 rounded-[3rem] hover:shadow-2xl'
                      : 'flex flex-col'
                      }`}
                  >
                    <div className={`relative bg-[#F9FAFB] rounded-[3rem] overflow-hidden flex items-center justify-center p-8 transition-all duration-700 ${viewMode === 'list' ? 'w-full md:w-80 h-80 flex-shrink-0' : 'aspect-square w-full mb-8 group-hover:shadow-2xl'
                      }`}>
                      <img
                        src={formatImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Floating Actions */}
                      <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
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
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isInWishlist(product.id) ? 'bg-brand-orange text-white' : 'bg-white text-gray-400 hover:text-red-500'
                            }`}
                        >
                          <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => openQuickView(product, e)}
                          className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-brand-orange transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col px-2">
                      <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.2em] bg-brand-orange/5 px-3 py-1 rounded-full">
                            {product.categories?.name || 'Essential'}
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em]">In Stock</span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Sold Out</span>
                          )}
                        </div>
                        <Link to={`/shop/${product.id}`}>
                          <h3 className={`font-black text-gray-900 leading-tight group-hover:text-brand-orange transition-colors ${viewMode === 'list' ? 'text-xl mb-4' : 'text-md mb-3 line-clamp-3'
                            }`}>
                            {product.name}
                          </h3>
                        </Link>
                        {viewMode === 'list' && (
                          <p className="text-gray-500 font-medium mb-8 max-w-2xl leading-relaxed">
                            {product.description || 'High-performance solution designed for modern workspace environments.'}
                          </p>
                        )}
                      </div>

                      <div className={`flex items-center justify-between pt-6 border-t border-gray-50 mt-4 ${viewMode === 'list' ? 'w-full' : ''}`}>
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-gray-900 tracking-tighter">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={addedProducts.has(product.id)}
                          className={`px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center gap-2 ${addedProducts.has(product.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-black text-white hover:bg-brand-orange transform hover:-translate-y-1'
                            }`}
                        >
                          {addedProducts.has(product.id) ? (
                            <>
                              <Check className="w-4 h-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl p-10 overflow-y-auto animate-slide-in-right rounded-l-[4rem]">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-12">
              {/* Mobile Search */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Search</h4>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Categories</h4>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleCategoryChange('all', null)} className={`px-5 py-2.5 rounded-full text-sm font-bold ${selectedCategory === 'all' ? 'bg-black text-white' : 'bg-gray-50 text-gray-500'}`}>All</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => handleCategoryChange(cat.id, cat.name)} className={`px-5 py-2.5 rounded-full text-sm font-bold ${selectedCategory === cat.id ? 'bg-brand-orange text-white' : 'bg-gray-50 text-gray-500'}`}>{cat.name}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Price Range</h4>
                  <span className="text-sm font-black text-brand-orange">${priceRange[1]}</span>
                </div>
                <input type="range" min="0" max={maxPriceLimit} step="10" value={priceRange[1]} onChange={handlePriceChange} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-brand-orange" />
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Availability</h4>
                <div className="space-y-4">
                  {['all', 'in-stock', 'out-of-stock'].map(status => (
                    <label key={status} className="flex items-center gap-4 cursor-pointer">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedAvailability === status ? 'border-brand-orange bg-brand-orange text-white' : 'border-gray-100 bg-gray-50'}`}>
                        {selectedAvailability === status && <Check className="w-4 h-4" />}
                      </div>
                      <input type="radio" name="mob-avail" className="hidden" value={status} checked={selectedAvailability === status} onChange={(e) => setSelectedAvailability(e.target.value)} />
                      <span className={`text-sm font-bold capitalize ${selectedAvailability === status ? 'text-gray-900' : 'text-gray-500'}`}>{status.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowMobileFilters(false)} className="w-full py-5 bg-black text-white font-bold rounded-3xl shadow-2xl mt-8 uppercase tracking-widest text-xs">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setQuickViewProduct(null)}
          ></div>
          <div className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-slide-up max-h-[90vh]">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-6 right-6 z-10 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            {/* Left: Image */}
            <div className="w-full md:w-1/2 bg-[#F9FAFB] p-12 flex items-center justify-center relative">
              <img
                src={formatImageUrl(quickViewProduct.image_url)}
                alt={quickViewProduct.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-10 md:p-16 overflow-y-auto">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/5 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                    {quickViewProduct.categories?.name || 'Essential'}
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    {quickViewProduct.name}
                  </h2>
                </div>

                <div className="text-3xl font-black text-gray-900 tracking-tighter">
                  ${parseFloat(quickViewProduct.price).toFixed(2)}
                </div>

                <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {quickViewProduct.description || 'High-performance solution designed for modern workspace environments.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl px-2 h-16 w-full sm:w-40">
                    <button
                      onClick={() => setQuickViewQuantity(Math.max(1, quickViewQuantity - 1))}
                      className="w-12 h-full flex items-center justify-center hover:bg-white rounded-xl transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-lg">{quickViewQuantity}</span>
                    <button
                      onClick={() => setQuickViewQuantity(quickViewQuantity + 1)}
                      className="w-12 h-full flex items-center justify-center hover:bg-white rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct, null, quickViewQuantity);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 h-16 bg-black text-white font-bold rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-1"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>

                <Link
                  to={`/shop/${quickViewProduct.id}`}
                  className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors pt-4"
                >
                  View Full Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-200 { animation-delay: 0.2s; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
      `}</style>
    </div>
  )
}
