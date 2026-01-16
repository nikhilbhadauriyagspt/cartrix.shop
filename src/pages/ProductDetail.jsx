import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../contexts/ToastContext'
import { addToRecentlyViewed } from '../utils/recentlyViewed'
import { formatImageUrl } from '../utils/formatUrl'
import RecentlyViewed from '../components/RecentlyViewed'
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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock
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
      addToRecentlyViewed(data)
      fetchRelatedProducts(data.category_id, data.id)
      document.title = `${data.name} - Modern Workspace`
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

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewComment.trim()) {
      addToast('Please enter a comment', 'error')
      return
    }
    setSubmittingReview(true)
    setTimeout(() => {
      addToast('Review submitted successfully!', 'success')
      setReviewComment('')
      setReviewRating(5)
      setSubmittingReview(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-brand-orange rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!product) return null

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => formatImageUrl(img))
    : [formatImageUrl(product.image_url) || '/placeholder-printer.jpg']

  const hasDiscount = product.discount_price && parseFloat(product.discount_price) < parseFloat(product.price)
  const displayPrice = hasDiscount ? product.discount_price : product.price
  const specifications = typeof product.specifications === 'object' ? product.specifications : {}

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800 selection:bg-brand-orange/10 selection:text-brand-orange">

      {/* 1. Header Spacer */}
      <div className="h-20 lg:h-24 bg-white border-b border-gray-50"></div>

      <div className="max-w-[1300px] mx-auto px-6 py-10">

        {/* Breadcrumb - Subtle */}
        <nav className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mb-10">
          <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <Link to="/shop" className="hover:text-brand-orange transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-gray-600 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left Column: Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50/50 rounded-[2rem] p-8 relative flex items-center justify-center border border-gray-100/50 group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-700 group-hover:scale-105"
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
                className={`absolute top-6 right-6 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border transition-all ${isInWishlist(product.id) ? 'bg-red-50 border-red-50 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl p-2 border transition-all ${selectedImage === idx
                      ? 'border-brand-orange bg-white shadow-sm'
                      : 'border-gray-100 bg-white opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                  {product.categories?.name || 'Workspace'}
                </span>
                {product.stock > 0 && (
                  <span className="text-[10px] font-semibold text-green-600/70 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    Available
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-xs font-semibold text-gray-700 ml-1.5">4.9</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                <span className="text-[11px] font-medium text-gray-400 hover:text-brand-orange cursor-pointer transition-colors">
                  128 Reviews
                </span>
              </div>
            </div>

            <div className="space-y-6 pb-8 border-b border-gray-50">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${parseFloat(displayPrice).toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-300 line-through font-medium">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-gray-50/50 rounded-xl h-14 w-full sm:w-36 border border-gray-100">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center font-semibold text-gray-700">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 h-14 bg-gray-900 text-white font-semibold rounded-xl hover:bg-brand-orange transition-all duration-300 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                >
                  {showSuccess ? (
                    <><Check className="w-5 h-5" /> Added</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges - Soft & Small */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: Truck, title: 'Free Delivery', color: 'text-blue-500/70', bg: 'bg-blue-50/50' },
                { icon: ShieldCheck, title: '1Y Warranty', color: 'text-green-600/70', bg: 'bg-green-50/50' },
                { icon: Zap, title: 'Easy Setup', color: 'text-orange-500/70', bg: 'bg-orange-50/50' },
                { icon: Clock, title: '24/7 Help', color: 'text-purple-500/70', bg: 'bg-purple-50/50' }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-white">
                  <div className={`w-9 h-9 rounded-lg ${badge.bg} ${badge.color} flex items-center justify-center flex-shrink-0`}>
                    <badge.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-semibold text-[11px] text-gray-600">{badge.title}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Info Tabs - Subtle */}
        <div className="mt-24">
          <div className="flex border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar gap-8">
            {['Description', 'Specifications', 'Reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.toLowerCase() ? 'text-brand-orange' : 'text-gray-300 hover:text-gray-400'
                  }`}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="w-full min-h-[200px]">
            {activeTab === 'description' && (
              <div className="text-gray-500 text-sm leading-relaxed font-normal animate-fade-in space-y-6">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 animate-fade-in">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-4 border-b border-gray-50">
                    <span className="font-semibold text-[10px] uppercase tracking-widest text-gray-400">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-[13px] text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-10 animate-fade-in">
                <div className="flex items-center gap-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 tracking-tight">4.9</div>
                    <div className="flex justify-center text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-orange w-[90%] rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">90% Recommended</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full h-32 px-5 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange/20 outline-none transition-all text-sm font-normal"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-8 h-12 bg-gray-900 text-white font-semibold rounded-xl hover:bg-brand-orange transition-all text-xs uppercase tracking-widest"
                  >
                    {submittingReview ? 'Sending...' : 'Post Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Related Products - Softened */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 tracking-tight">Related Collection</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <div key={related.id} className="group flex flex-col space-y-4">
                  <Link
                    to={`/shop/${related.id}`}
                    className="aspect-square bg-gray-50/50 rounded-2xl p-6 relative flex items-center justify-center border border-gray-100/50 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <img
                      src={formatImageUrl(related.image_url) || '/placeholder-printer.jpg'}
                      alt={related.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="space-y-1">
                    <Link to={`/shop/${related.id}`}>
                      <h3 className="font-semibold text-gray-800 text-sm truncate hover:text-brand-orange transition-colors">
                        {related.name}
                      </h3>
                    </Link>
                    <p className="text-gray-900 font-bold text-base">
                      ${parseFloat(related.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <RecentlyViewed />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
