import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'
import { Trash2, ShoppingCart, Heart, ArrowRight, X } from 'lucide-react'

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()

  useEffect(() => {
    document.title = 'My Wishlist'
  }, [])

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
        <div className="text-center max-w-lg relative z-10">
          <div className="w-32 h-32 bg-gray-50 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-10 font-medium">
            Save items you love here to buy them later.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-brand-orange transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Header */}
      <div className="py-16 border-b border-gray-50">
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            My Wishlist <span className="text-gray-400 font-normal text-2xl ml-2">({wishlistItems.length})</span>
          </h1>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-6 py-12">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-6 px-8 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                  <th className="py-6 px-8 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                  <th className="py-6 px-8 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Stock Status</th>
                  <th className="py-6 px-8 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wishlistItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-6">
                        <Link to={`/shop/${item.products.id}`} className="flex-shrink-0">
                          <div className="w-24 h-24 bg-white rounded-2xl border border-gray-100 p-2 flex items-center justify-center overflow-hidden">
                            <img
                              src={item.products.image_url || '/placeholder-printer.jpg'}
                              alt={item.products.name}
                              className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </Link>
                        <div>
                          <Link to={`/shop/${item.products.id}`}>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-brand-orange transition-colors mb-1 line-clamp-1">
                              {item.products.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.products.description?.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-xl font-black text-gray-900">
                        ${parseFloat(item.products.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        In Stock
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => addToCart(item.products.id)}
                          className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-brand-orange transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm uppercase tracking-wider"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.products.id)}
                          className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                          title="Remove from Wishlist"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}