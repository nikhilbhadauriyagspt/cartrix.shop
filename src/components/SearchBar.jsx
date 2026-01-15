import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, Loader2, PackageSearch } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Grid, Mousewheel } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/grid'

export default function SearchBar({ placeholder = "Search...", className = "" }) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleOpenEvent = () => setIsOverlayOpen(true)
    window.addEventListener('openSearch', handleOpenEvent)
    
    if (isOverlayOpen && inputRef.current) {
      inputRef.current.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('openSearch', handleOpenEvent)
      document.body.style.overflow = 'unset'
    }
  }, [isOverlayOpen])

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.length >= 1) {
        performSearch()
      } else {
        setResults([])
        setHasSearched(false)
      }
    }, 400)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category_id')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)

      if (error) throw error
      setResults(data || [])
      setHasSearched(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOverlayOpen(false)
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  const handleSearchNavigation = (e) => {
    if (e.key === 'Enter' && query.length >= 1) {
      navigate(`/shop?search=${encodeURIComponent(query)}`)
      handleClose()
    }
  }

  return (
    <>
      {/* Header Trigger */}
      <div
        onClick={() => setIsOverlayOpen(true)}
        className={`relative cursor-pointer group ${className}`}
      >
        <div className="flex items-center w-full h-12 px-6 bg-[#F9FAFB] rounded-full border border-gray-200 hover:border-brand-orange/50 hover:bg-white transition-all duration-300 group-hover:shadow-sm">
          <Search className="w-5 h-5 text-gray-400 group-hover:text-brand-orange transition-colors mr-3" />
          <span className="text-sm text-gray-500 font-medium truncate select-none group-hover:text-gray-900">
            {placeholder}
          </span>
        </div>
      </div>

      {/* Full Screen Overlay */}
      {isOverlayOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col pt-12">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 hover:rotate-90 duration-300"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Search Input Area */}
          <div className="w-full max-w-5xl mx-auto mb-16 px-6 text-center">
            <div className="relative border-b-2 border-white/10 focus-within:border-brand-orange transition-colors duration-500 pb-4">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchNavigation}
                placeholder="What are you looking for?"
                className="w-full pl-14 pr-4 py-2 bg-transparent text-4xl md:text-6xl font-black text-white placeholder-white/10 outline-none tracking-tighter text-left"
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 w-full max-w-[1800px] mx-auto overflow-hidden flex flex-col px-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Loader2 className="w-12 h-12 animate-spin text-brand-orange mb-4" />
                <p className="text-white font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
              </div>
            ) : hasSearched && results.length > 0 ? (
              <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">
                    Matches Found ({results.length})
                  </h3>
                  <button
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(query)}`)
                      handleClose()
                    }}
                    className="group text-sm font-black text-brand-orange hover:text-white transition-colors flex items-center gap-2"
                  >
                    EXPLORE ALL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* 2-Row Swiper Slider */}
                <div className="flex-1 min-h-0 -mx-4 px-4 overflow-visible">
                  <Swiper
                    modules={[FreeMode, Grid, Mousewheel]}
                    slidesPerView={1.5}
                    grid={{
                      rows: results.length > 4 ? 2 : 1,
                      fill: 'row'
                    }}
                    spaceBetween={20}
                    freeMode={true}
                    mousewheel={{ forceToAxis: true }}
                    breakpoints={{
                      640: { slidesPerView: 2.5 },
                      1024: { slidesPerView: 4.5 },
                      1440: { slidesPerView: 5.5 },
                    }}
                    className="h-full w-full search-results-swiper"
                  >
                    {results.map((product) => (
                      <SwiperSlide key={product.id} className="h-auto">
                        <Link
                          to={`/shop/${product.id}`}
                          onClick={handleClose}
                          className="group bg-white rounded-[2rem] p-4 hover:bg-brand-orange transition-all duration-500 shadow-2xl h-full flex flex-col"
                        >
                          <div className="aspect-square bg-gray-50 rounded-3xl mb-4 p-4 overflow-hidden relative flex items-center justify-center">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="mt-auto">
                            <h4 className="font-bold text-gray-900 group-hover:text-white text-sm line-clamp-1 mb-1 transition-colors">
                              {product.name}
                            </h4>
                            <p className="font-black text-brand-orange group-hover:text-white text-lg transition-colors">
                              ${parseFloat(product.price).toFixed(0)}
                            </p>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="text-center mt-20 bg-white/5 py-20 rounded-[3rem] border border-white/5 max-w-2xl mx-auto">
                <PackageSearch className="w-16 h-16 text-white/20 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white mb-2">No Matches Found</h3>
                <p className="text-white/40 font-medium">Try searching for something else like "Ink" or "Laser Printer"</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-10">
                <span className="text-[15vw] font-black text-white tracking-tighter select-none pointer-events-none">EXPLORE</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .search-results-swiper {
          padding-bottom: 40px !important;
        }
        .search-results-swiper .swiper-wrapper {
          flex-direction: row !important;
        }
        .search-results-swiper .swiper-slide {
          height: calc((100% - 20px) / 2) !important;
          margin-top: 0 !important;
        }
        @media (max-width: 640px) {
          .search-results-swiper .swiper-slide {
            height: auto !important;
          }
        }
      `}</style>
    </>
  )
}