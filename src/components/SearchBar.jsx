import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, TrendingUp, ArrowRight, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatImageUrl } from '../utils/formatUrl'

export default function SearchBar({ placeholder = "Search for printers, ink...", className = "" }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug')
        .limit(8)
      if (data) setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      } else {
        setResults([])
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category_id')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(6)

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/shop/${productId}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleTagClick = (tag) => {
    if (tag.slug) {
      navigate(`/shop/category/${tag.slug}`)
    } else if (tag.query) {
      navigate(`/shop?search=${encodeURIComponent(tag.query)}`)
    }
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative z-50 ${className}`}>
      
      {/* Input Container */}
      <form 
        onSubmit={handleSearchSubmit} 
        className={`
          relative flex items-center bg-gray-100/80 border-2 transition-all duration-300 rounded-full
          ${isOpen ? 'bg-white border-brand-orange shadow-lg ring-4 ring-brand-orange/10' : 'border-transparent hover:bg-gray-100 hover:border-gray-200'}
        `}
      >
        <Search className={`ml-4 w-5 h-5 transition-colors ${isOpen ? 'text-brand-orange' : 'text-gray-400'}`} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 w-full h-12 px-3 bg-transparent text-gray-900 text-sm font-medium placeholder:text-gray-500 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              if (!isOpen) setIsOpen(false)
            }}
            className="p-1 mr-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button 
          type="submit"
          className="m-1 px-6 h-10 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-brand-orange transition-all duration-300 shadow-sm hover:shadow-md hidden sm:block"
        >
          Search
        </button>
      </form>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
              <span className="text-sm font-medium animate-pulse">Searching catalog...</span>
            </div>
          ) : query.length < 2 ? (
            // Empty State / Popular Tags
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-sm uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-brand-orange" />
                Popular Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTagClick(cat)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-brand-orange hover:text-white rounded-full text-sm font-medium text-gray-600 transition-all border border-gray-100 hover:border-brand-orange group"
                  >
                    <Tag className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            // Results List
            <div>
              <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Products</span>
                <span className="text-xs font-bold text-brand-orange">{results.length} matches</span>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center gap-4"
                  >
                    <div className="w-14 h-14 bg-white border border-gray-100 rounded-lg p-1.5 flex-shrink-0 group-hover:border-brand-orange/30 transition-colors">
                      <img
                        src={formatImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-orange truncate transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 opacity-70">
                        Top quality printing accessory
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-brand-orange text-sm">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium line-through decoration-brand-orange/50">
                        ${(parseFloat(product.price) * 1.2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Footer */}
              <div 
                onClick={handleSearchSubmit}
                className="p-3 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors text-center group"
              >
                <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-brand-orange">
                  View all results for "{query}" 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ) : (
            // No Results
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No matches found</h3>
              <p className="text-sm text-gray-500">
                We couldn't find anything for "{query}". <br/>Try checking for typos or use different keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}