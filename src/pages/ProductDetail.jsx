import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../contexts/ToastContext'
import {
  ShoppingCart,
  Check,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Lock,
  Heart,
  Home,
  Plus,
  Minus,
  Share2
} from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    setProduct(null)
    setRelatedProducts([])
    setLoading(true)
    setSelectedImage(0)
    setQuantity(1)
    window.scrollTo(0, 0)
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        navigate('/shop')
        return
      }

      setProduct(data)
      fetchRelatedProducts(data.category_id, data.id)
      document.title = `${data.name} - Premium Printers`
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (categoryId, productId) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('category_id', categoryId)
        .neq('id', productId)
        .limit(4)
      setRelatedProducts(data || [])
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      await addToCart(product.id, quantity)
      addToast(`${product.name} added to cart!`, 'success')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    setTimeout(() => navigate('/checkout'), 500)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewComment.trim()) {
      addToast('Please enter a comment', 'error')
      return
    }
    setSubmittingReview(true)
    // Mocking a delay for submission
    setTimeout(() => {
      addToast('Review submitted successfully! It will appear after moderation.', 'success')
      setReviewComment('')
      setReviewRating(5)
      setSubmittingReview(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-brand-orange"></div>
      </div>
    )
  }

  if (!product) return null

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image_url || '/placeholder-printer.jpg']

  const hasDiscount = product.discount_price && parseFloat(product.discount_price) < parseFloat(product.price)
  const displayPrice = hasDiscount ? product.discount_price : product.price
  const specifications = typeof product.specifications === 'object' ? product.specifications : {}

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-12 font-medium">
          <Link to="/" className="hover:text-brand-orange flex items-center gap-1 transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <Link to="/shop" className="hover:text-brand-orange transition-colors">Shop</Link>
          {product.categories && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <Link to={`/shop?category=${product.categories.name}`} className="hover:text-brand-orange transition-colors">
                {product.categories.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">

          {/* Left Column: Gallery */}
          <div className="space-y-8">
            <div className="aspect-square bg-[#F9FAFB] rounded-[3rem] p-8 relative group overflow-hidden border border-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => {
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id);
                    addToast('Removed from wishlist', 'success');
                  } else {
                    addToWishlist(product.id);
                    addToast('Added to wishlist', 'success');
                  }
                }}
                className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 ${isInWishlist(product.id) ? 'bg-brand-orange text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl p-2 border-2 transition-all ${selectedImage === idx
                      ? 'border-brand-orange bg-brand-orange/5'
                      : 'border-transparent bg-[#F9FAFB] hover:border-gray-200'
                      }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
                {product.categories?.name || 'Printer'}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-gray-500">(128 Reviews)</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> In Stock
                </span>
              </div>
            </div>

            <div className="mb-10 pb-10 border-b border-gray-100">
              <div className="flex items-end gap-4 mb-6">
                <span className="text-5xl font-black text-gray-900">
                  ${parseFloat(displayPrice).toFixed(2)}
                </span>
                {hasDiscount && (
                  <div className="mb-2">
                    <span className="text-xl text-gray-400 line-through block">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-500 leading-relaxed">
                {product.description?.substring(0, 150)}...
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              <div className="flex items-center border-2 border-gray-100 rounded-2xl h-16 w-full sm:w-40">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 rounded-l-2xl transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 rounded-r-2xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 h-16 bg-black text-white font-bold rounded-2xl hover:bg-brand-orange transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {showSuccess ? (
                  <>
                    <Check className="w-6 h-6" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Free Delivery</h4>
                  <p className="text-xs text-gray-500"></p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Official Warranty</h4>
                  <p className="text-xs text-gray-500">1 Year coverage</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">30 Days Return</h4>
                  <p className="text-xs text-gray-500">Hassle-free policy</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
                  <p className="text-xs text-gray-500">100% Protected</p>
                </div>
              </div>
            </div>



          </div>

        </div>
        {/* Accordion/Tabs - Simplified */}
        <div className="space-y-4 w-full pt-5">
          <div className="border border-gray-100 rounded-3xl p-8 bg-[#F9FAFB]">
            <div className="flex gap-8 border-b border-gray-200/60 mb-6 pb-4 overflow-x-auto no-scrollbar">
              {['Description', 'Specifications', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab.toLowerCase() ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="text-gray-600 leading-relaxed min-h-[200px]">
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none text-gray-500">
                  {product.description}
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b border-gray-200/50">
                    <span className="font-medium text-gray-900 capitalize">Status</span>
                    <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200/50">
                      <span className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500">{value}</span>
                    </div>
                  ))}
                  {Object.entries(specifications).length === 0 && !product.stock && (
                    <p>No specific specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-12">
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-5xl font-black text-gray-900 mb-2">4.8</div>
                    <div className="flex justify-center text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="text-sm font-medium text-gray-500">Based on 128 verified reviews</p>
                  </div>

                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className={`p-1 transition-colors ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                            >
                              <Star className={`w-8 h-8 ${reviewRating >= star ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          className="w-full h-32 px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white outline-none transition-all resize-none font-medium"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full sm:w-auto px-10 h-14 bg-black text-white font-bold rounded-xl hover:bg-brand-orange transition-all disabled:bg-gray-400"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <h2 className="text-3xl font-black text-gray-900 mb-12">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  to={`/shop/${related.id}`}
                  className="group bg-white rounded-[2.5rem] p-6 border border-gray-100 hover:shadow-xl hover:border-brand-orange/20 transition-all duration-500"
                >
                  <div className="aspect-square bg-[#F9FAFB] rounded-[2rem] mb-6 p-6 relative group overflow-hidden">
                    <img
                      src={related.image_url || '/placeholder-printer.jpg'}
                      alt={related.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWishlist(related.id)) {
                          removeFromWishlist(related.id);
                          addToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist(related.id);
                          addToast('Added to wishlist', 'success');
                        }
                      }}
                      className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${isInWishlist(related.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(related.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 truncate group-hover:text-brand-orange transition-colors">
                      {related.name}
                    </h3>
                    <p className="text-brand-orange font-black text-xl">
                      ${parseFloat(related.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
