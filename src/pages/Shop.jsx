import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import {
  Search,
  Filter,
  Grid3X3,
  List,
  ShoppingCart,
  Star,
  Check,
  X,
} from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useWebsite } from '../contexts/WebsiteContext'

// Helper function to generate URL-friendly slugs
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars except space and hyphen
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

export default function Shop() {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams() // Re-add useSearchParams
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [loading, setLoading] = useState(true)
  const [addedProducts, setAddedProducts] = useState(new Set())
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isInitialCategoryLoadComplete, setIsInitialCategoryLoadComplete] = useState(false) // New state

  const { addToCart } = useCart()
  const { websiteId } = useWebsite()

  // Initial setup for document title and search query
  useEffect(() => {
    document.title = 'Shop - Premium Printers & Accessories'
    const searchParam = searchParams.get('search')
    if (searchParam) setSearchQuery(searchParam)
  }, [searchParams])

  // Effect to fetch categories and initialize selectedCategory from URL
  useEffect(() => {
    const initCategoriesAndSetFilter = async () => {
      if (!websiteId) return

      const fetchedCategories = await fetchCategories()

      if (categorySlug && fetchedCategories.length > 0) {
        const matchingCategory = fetchedCategories.find(
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

    initCategoriesAndSetFilter()
  }, [websiteId, categorySlug])

  // Effect to fetch products based on filters
  useEffect(() => {
    if (websiteId && isInitialCategoryLoadComplete) { // Only fetch products if websiteId is available and initial category load is complete
      fetchProducts()
    }
  }, [selectedCategory, selectedPrice, sortBy, searchQuery, websiteId, isInitialCategoryLoadComplete]) // Add isInitialCategoryLoadComplete to dependencies

  // Refactored fetchCategories to return data
  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      setCategories(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*, categories(*)')

      // Category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      // Search query
      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        )
      }
      // Price filter
      if (selectedPrice !== 'all') {
        const [min, max] = selectedPrice.split('-')
        query = query.gte('price', min)
        if (max) query = query.lte('price', max)
      }

      // Sorting
      if (sortBy === 'price-low') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
      else if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
      else query = query.order('created_at', { ascending: false }) // featured = newest

      const { data } = await query
      setProducts(data || [])
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
    
    // Preserve existing search params (like 'search')
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

    console.log('Navigating to:', newPath); // Diagnostic log
    navigate(newPath);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPrice('all');
    setSortBy('featured');

    // Preserve existing search params (like 'search')
    const preservedParams = new URLSearchParams();
    if (searchParams.get('search')) {
      preservedParams.set('search', searchParams.get('search'));
    }
    const queryString = preservedParams.toString();
    const finalQueryString = queryString ? `?${queryString}` : '';
    
    // Navigate to base shop path, but keep the search query
    navigate(`/shop${finalQueryString}`);
  }

  const hasActiveFilters = selectedCategory !== 'all' || selectedPrice !== 'all'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect Printer
          </h1>
          <p className="text-xl mb-10 opacity-90">
            Premium quality • Fast shipping • Expert support
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary-200" />
              <input
                type="text"
                placeholder="Search by model, brand, or feature..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sticky top-20">
    {/* Header */}
    <div className="flex items-center justify-between mb-7">
      <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>

    {/* Category Section */}
<div className="mb-8">
  <div className="flex items-center gap-2 mb-4">
    <Grid3X3 className="w-4 h-4 text-gray-500" />
    <h4 className="text-base font-medium text-gray-800">Category</h4>
  </div>
  <div className="space-y-2.5">
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          name="category"
          value="all"
          checked={selectedCategory === 'all'}
          onChange={() => handleCategoryChange('all', null)}
          className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
        />
        {/* Outer light circle - always visible */}
        <div className="absolute w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-primary-600 transition-colors"></div>
        {/* Inner filled dot - only when selected */}
        <div className="w-2.5 h-2.5 rounded-full bg-primary-600 scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
      </div>
      <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
        All Printers
      </span>
    </label>

    {categories.map((cat) => (
      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            name="category"
            value={cat.id}
            checked={selectedCategory === cat.id}
            onChange={() => handleCategoryChange(cat.id, cat.name)}
            className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
          />
          {/* Outer light circle */}
          <div className="absolute w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-primary-600 transition-colors"></div>
          {/* Inner filled dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-primary-600 scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
        </div>
        <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
          {cat.name}
        </span>
      </label>
    ))}
  </div>
</div>

    {/* Price Range Section */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-base font-medium text-gray-800">Price Range</h4>
      </div>
      <select
        value={selectedPrice}
        onChange={(e) => setSelectedPrice(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
      >
        <option value="all">All Prices</option>
        <option value="0-200">Under $200</option>
        <option value="200-500">$200 – $500</option>
        <option value="500-1000">$500 – $1000</option>
        <option value="1000">$1000+</option>
      </select>
    </div>
  </div>
</aside>

          {/* Products Area */}
          <div className="flex-1">
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 sticky top-20 z-50 p-2 rounded-xl bg-white">
              <div>
                <h2 className="text-3xl font-bold">All Products</h2>
                <p className="text-gray-600 mt-2">{products.length} printers available</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-5 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-white text-primary-600 text-xs px-2 py-1 rounded-full">
                      !
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Products Grid / List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-3xl h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-100 w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No printers found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'space-y-6'
                }
              >
                {products.map((product) => (
                 <Link
    key={product.id}
    to={`/shop/${product.id}`}
    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full border border-gray-100"
  >
    {/* Image Section - Soft & Clean */}
    <div className="relative bg-gray-50/50 overflow-hidden">
      <img
        src={product.image_url || '/placeholder-printer.jpg'}
        alt={product.name}
        className="w-full h-72 object-contain p-8 group-hover:scale-105 transition-transform duration-700"
        loading="lazy"
      />
      {/* Soft In Stock Badge */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-green-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
        In Stock
      </div>

      {/* Hover Quick Add - Subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
        <button
          onClick={(e) => handleAddToCart(product, e)}
          className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
            addedProducts.has(product.id)
              ? 'bg-green-600 text-white'
              : 'bg-white/90 text-gray-800 hover:bg-white'
          }`}
        >
          {addedProducts.has(product.id) ? (
            <>
              <Check className="w-5 h-5" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>

    {/* Content - Soft & Airy */}
    <div className="p-7 flex flex-col flex-grow">
      {/* Category - Subtle */}
      <p className="text-gray-500 text-sm font-medium mb-2">
        {product.categories?.name || 'Printer'}
      </p>

      {/* Title - Clean */}
      <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-4 group-hover:text-primary-600 transition-colors">
        {product.name}
      </h3>

      {/* Rating - Minimal */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">4.5</span>
      </div>

      {/* Price & Button - Balanced */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-900">
          ${parseFloat(product.price).toFixed(2)}
        </span>

        <button
          onClick={(e) => handleAddToCart(product, e)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            addedProducts.has(product.id)
              ? 'bg-green-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600'
          }`}
        >
          {addedProducts.has(product.id) ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {addedProducts.has(product.id) ? 'Added' : 'Add'}
          </span>
        </button>
      </div>
    </div>
  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-10">
              <div>
                <h4 className="font-semibold text-lg mb-5">Category</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mobile-category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={() => handleCategoryChange('all', null)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <span>All Printers</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={() => handleCategoryChange(cat.id, cat.name)}
                        className="w-5 h-5 text-primary-600"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-5">Price Range</h4>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300"
                >
                  <option value="all">All Prices</option>
                  <option value="0-200">Under $200</option>
                  <option value="200-500">$200 – $500</option>
                  <option value="500-1000">$500 – $1000</option>
                  <option value="1000">$1000+</option>
                </select>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}