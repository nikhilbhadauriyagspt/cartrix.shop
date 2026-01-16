import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { Trash2, ShoppingCart, Heart, ArrowRight, X, Sparkles, ShoppingBag } from 'lucide-react'
import { formatImageUrl } from '../utils/formatUrl'

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const [addedProducts, setAddedProducts] = useState(new Set())

  useEffect(() => {
    document.title = 'My Wishlist - Premium Printers'
    window.scrollTo(0, 0)
  }, [])

  const handleAddToCart = async (product) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-brand-orange"></div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="text-center max-w-lg relative z-10 animate-slide-up">
          <div className="w-40 h-40 bg-gray-50 rounded-[3rem] mx-auto mb-10 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
            <Heart className="w-16 h-16 text-gray-200" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-12 font-medium text-lg">
            Save items you love here to buy them later. Your future workspace is waiting.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white font-bold rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-2xl hover:shadow-brand-orange/20 transform hover:-translate-y-1 text-sm uppercase tracking-widest"
          >
            Start Exploring <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-orange selection:text-white pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Saved For Later
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] animate-slide-up">
              My <span className="text-gray-400">Wishlist.</span>
              <span className="text-brand-orange text-2xl md:text-3xl ml-4 align-top">({wishlistItems.length})</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white flex flex-col animate-slide-up transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative bg-[#F9FAFB] rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8 mb-6 transition-all duration-700 group-hover:shadow-2xl">
                <Link to={`/shop/${item.products.id}`} className="w-full h-full aspect-square flex items-center justify-center">
                  <img
                    src={formatImageUrl(item.products.image_url)}
                    alt={item.products.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                  />
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => {
                    removeFromWishlist(item.products.id)
                    addToast('Removed from wishlist', 'success')
                  }}
                  className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                  title="Remove from Wishlist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 flex flex-col px-2">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.2em] bg-brand-orange/5 px-2.5 py-1 rounded-full">
                      {item.products.categories?.name || 'Premium'}
                    </span>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em]">In Stock</span>
                  </div>
                  <Link to={`/shop/${item.products.id}`}>
                    <h3 className="font-black text-gray-900 leading-tight group-hover:text-brand-orange transition-colors text-lg line-clamp-2">
                      {item.products.name}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                  <span className="text-xl font-black text-gray-900 tracking-tighter">
                    ${parseFloat(item.products.price).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleAddToCart(item.products)}
                    disabled={addedProducts.has(item.products.id)}
                    className={`p-3.5 rounded-xl transition-all duration-300 ${
                      addedProducts.has(item.products.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-black text-white hover:bg-brand-orange shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {addedProducts.has(item.products.id) ? (
                      <ShoppingCart className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-20 flex flex-col items-center justify-center p-12 bg-gray-50 rounded-[3rem] border border-gray-100 text-center">
          <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Found everything you need?</h3>
          <p className="text-gray-500 font-medium mb-8 max-w-md">
            Check your cart and proceed to a secure checkout to bring these premium tools home.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="px-8 py-4 bg-white text-black border border-gray-200 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
            >
              Continue Shopping
            </Link>
            <Link
              to="/cart"
              className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-brand-orange transition-all shadow-xl text-sm uppercase tracking-widest flex items-center gap-2"
            >
              Go to Cart <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
      `}</style>
    </div>
  )
}