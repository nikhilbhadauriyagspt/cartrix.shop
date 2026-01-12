import { useState, useEffect, useRef } from 'react'
import { Search, X, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SearchBar({ placeholder = "Search products...", variant = "default" }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch()
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, description')
        .or(`name.ilike.*${query}*,description.ilike.*${query}*`)


      if (error) throw error

      setResults(data || [])
      setIsOpen(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.length >= 2) {
      navigate(`/shop?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const hasResults = results.length > 0

  const inputClasses = variant === "hero"
    ? "w-full pl-12 pr-12 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all shadow-lg"
    : "w-full pl-10 pr-10 py-2.5 text-sm rounded-full border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"

  const iconSize = variant === "hero" ? "w-6 h-6" : "w-5 h-5"

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${iconSize}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClasses}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className={iconSize} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-3xl shadow-2xl border-2 border-primary-200 max-h-[400px] overflow-y-auto z-50">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : hasResults ? (
            <div className="py-2">
              <div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center">
                  <Package className="w-4 h-4 mr-2 text-primary-500" />
                  Products ({results.length})
                </div>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    onClick={handleResultClick}
                    className="flex items-center px-4 py-3 hover:bg-primary-50 transition-colors border-l-4 border-transparent hover:border-primary-500 rounded-2xl mx-2"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-2xl mr-3 flex-shrink-0 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                    </div>
                    <span className="ml-3 font-extrabold text-primary-600 flex-shrink-0 text-lg">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold">No results found</p>
              <p className="text-sm mt-1">Try searching for something else or press Enter to see all results</p>
            </div>
          )}
          {query.length >= 2 && (
            <div className="border-t-2 border-primary-100 p-3 text-center">
              <button
                onClick={() => {
                  navigate(`/shop?search=${encodeURIComponent(query)}`)
                  setIsOpen(false)
                  setQuery('')
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-bold"
              >
                View all results for "{query}" in Shop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
