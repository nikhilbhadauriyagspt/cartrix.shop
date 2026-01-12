import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import {
  ShoppingCart,
  Check,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Lock,
  Share2,
  Heart,
  Home,
  Plus,
  Minus,
} from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('specifications')
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading product details...</div>
      </div>
    )
  }

  if (!product) return null

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image_url || '/placeholder-printer.jpg']

  const hasDiscount = product.discount_price && parseFloat(product.discount_price) < parseFloat(product.price)
  const displayPrice = hasDiscount ? product.discount_price : product.price
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)
    : 0

  const specifications = typeof product.specifications === 'object' ? product.specifications : {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb - Soft */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-10">
          <Link to="/" className="hover:text-gray-900 flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-gray-900">Shop</Link>
          {product.categories && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-500">{product.categories.name}</span>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-0">
          {/* Image Gallery - Clean */}
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-10"
                loading="lazy"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-primary-600 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Airy */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium mb-3">
              {product.categories?.name || 'Printer'}
            </span>
            <h1 className="text-4xl font-semibold text-gray-900 mb-6">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8 • 127 reviews</span>
            </div>

            {/* Price & Discount */}
            <div className="mb-10">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-semibold text-gray-900">
                  ${parseFloat(displayPrice).toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-white bg-red-600 px-4 py-1.5 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-10 text-gray-700 leading-relaxed">
              <p className={!isDescriptionExpanded ? 'line-clamp-5' : ''}>
                {product.description || 'High-quality laser printer with advanced features, reliable performance, and excellent print quality.'}
              </p>
              {product.description && product.description.length > 250 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-primary-600 text-sm font-medium mt-4 hover:text-primary-700"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 mb-10">
              <span className="text-gray-700 font-medium">Quantity</span>
              <div className="flex items-center border border-gray-300 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-4 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-4 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`flex-1 py-5 px-8 rounded-xl font-medium transition-all flex items-center justify-center gap-4 shadow-md ${
                  showSuccess
                    ? 'bg-green-600 text-white'
                    : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
                }`}
              >
                {showSuccess ? (
                  <>
                    <Check className="w-6 h-6" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-5 px-8 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all shadow-md"
              >
                Buy Now
              </button>
            </div>

          

           
          </div>
        </div>
         {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 pb-8 border-t border-gray-200">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
                { icon: Shield, title: '1-Year Warranty', desc: 'Full Coverage' },
                { icon: RefreshCw, title: '30-Day Returns', desc: 'Easy & Free' },
                { icon: Lock, title: 'Secure Payment', desc: '100% Protected' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <item.icon className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

        {/* Tabs - Minimal */}
        <div className=" pt-12">
          <div className="flex gap-12 border-b border-gray-200 mb-10">
            {['Specifications', 'Warranty', 'Reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-4 text-base font-medium transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-10">
            {activeTab === 'specifications' && (
  <div className="space-y-10">
    
    {/* Full Description */}
    {product.description && (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Product Description
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>
    )}

    {/* Specifications */}
    {Object.keys(specifications).length > 0 && (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Technical Specifications
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(specifications).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between py-4 border-b border-gray-100"
            >
              <span className="text-gray-600 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="font-medium text-gray-900">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}


            {activeTab === 'warranty' && (
              <div className=" text-gray-700 space-y-5 bg-white rounded-2xl border border-gray-100 p-8">
                <p>This printer comes with a standard 1-year manufacturer warranty covering defects in materials and workmanship.</p>
                <ul className="space-y-4">
                  {['Parts & Labor Coverage', 'Free Technical Support', 'Fast Replacement Service', 'Extended Warranty Available'].map((item) => (
                    <li key={item} className="flex items-center gap-4">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl font-bold text-gray-900 mb-4">4.8</div>
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-10 h-10 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-lg">Based on 127 customer reviews</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-semibold text-gray-900 mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  to={`/shop/${related.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={related.image_url || '/placeholder-printer.jpg'}
                      alt={related.name}
                      className="w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-4 group-hover:text-primary-600 transition">
                      {related.name}
                    </h3>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${parseFloat(related.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}