import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import {
  Printer, Sparkles, ShoppingCart, ArrowRight, CheckCircle, Truck, Shield, Star, ChevronRight, HeadphonesIcon, DollarSign, Award, Package, Users, BookOpen, Search, Lightbulb, TrendingUp, CreditCard
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { useCart } from '../contexts/CartContext'
import CategorySection from '../components/CategorySection'
import TestimonialSection from '../components/TestimonialSection'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedProducts, setAddedProducts] = useState(new Set())
  const { addToCart } = useCart()

  useEffect(() => {
    document.title = 'Home - Modern E-commerce Store'
    // Optional: Update meta tags if needed
    // const setMetaTag = (name, content) => { /* ... */ }
    // setMetaTag('description', 'Discover modern products and solutions.')
    // setMetaTag('keywords', 'ecommerce, modern, shop, products')

    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 8000)
      )

      const fetchPromise = supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .order('created_at', { ascending: false })
        .limit(12)

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
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

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 md:py-0">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 opacity-30  pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-blob-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-blob-slow animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/70  backdrop-blur-sm mb-6 mx-auto lg:mx-0">
                <Sparkles size={18} className="text-primary-600 
                " />
                <span className="text-sm font-medium text-primary-700 ">
                  Next-Gen Printing Technology 2026
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-8">
                <span className="text-gray-900 ">Print Smarter.</span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-600 bg-clip-text text-transparent">
                  Print Better.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-700  max-w-3xl mx-auto lg:mx-0  leading-relaxed">
                Professional-grade printers. Lightning-fast speeds.
                <span className="font-semibold text-primary-600 "> Zero compromises.</span>
              </p>
              <div className="my-5 max-w-3xl mx-auto">
                <SearchBar placeholder="Search for products..." />
              </div>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <a
                  href="/printers"
                  className="
                  group relative px-10 py-3 rounded-full font-bold text-md
                  bg-gradient-to-r from-primary-600 to-primary-700 text-white
                  flex items-center justify-center gap-3
                "
                >
                  Explore Printers
                  <Printer className="group-hover:rotate-12 transition-transform" size={24} />
                </a>

                <a
                  href="/compare"
                  className="
                  px-10 py-3 rounded-full font-bold text-md
                  border-2 border-primary-500/70 text-primary-700 
                "
                >
                  Compare Models →
                </a>
              </div>

              {/* Trust signals - compact colorful style */}
              <div className="mt-12 ">
                <div className="
    flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 
    px-7 py-5 rounded-2xl 
    bg-gradient-to-r from-green-50/70 to-emerald-50/70 
    
    backdrop-blur-md 
    border border-green-200/60 
    shadow-md shadow-green-200/30 
  ">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-green-600 ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 ">2 Year Warranty</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-green-600 ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 ">Free Shipping ₹999+</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-green-600 ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 ">24×7 Expert Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - Images / Visuals */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                {/* Main printer image - you can replace with real product shots */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-600/20 transform hover:scale-[1.03] transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&w=1200&q=80"
                    alt="Modern professional printer"
                    className="w-full h-auto object-cover aspect-[4/3] brightness-95"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>

                {/* Floating secondary images / accents */}
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-2xl overflow-hidden border-8 border-white/80 shadow-xl transform rotate-6">
                  <img
                    src="assets/hero/hero1.jpg"
                    alt="Printer detail"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-2xl overflow-hidden border-8 border-white/80 shadow-xl transform -rotate-6">
                  <img
                    src="assets/hero/hero2.jpg"
                    alt="Fast printing"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Mobile version - single image below content */}
            <div className="lg:hidden mt-12 mx-auto max-w-md">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary-600/20">
                <img
                  src="assets/hero/hero1.jpg"
                  alt="Modern professional printer"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
        @keyframes blob-slow {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(120px, 80px) scale(1.15); }
          66%  { transform: translate(-80px, 140px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob-slow {
          animation: blob-slow 20s infinite ease-in-out;
        }
        .animation-delay-4000 {
          animation-delay: 5s;
        }
      `}</style>
      </section>


      {/* Value Propositions Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto border-b border-gray-200 pb-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

            <div className='flex text-start gap-5 border-gray-200 border-r'>
              <div className="w-14 h-14  mb-4 flex items-center justify-center rounded-full bg-primary-50">
                <Truck className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Fast & Free Shipping
                </h3>
                <p className="text-sm text-gray-600">
                  Quick delivery with no extra cost.
                </p>
              </div>
            </div>

            <div className=' flex text-start gap-5 border-gray-200 border-r'>
              <div className="w-14 h-14  mb-4 flex items-center justify-center rounded-full bg-primary-50">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Secure Payments
                </h3>
                <p className="text-sm text-gray-600">
                  Encrypted & safe payment system.
                </p>
              </div>
            </div>

            <div className='flex text-start gap-5'>
              <div className="w-14 h-14  mb-4 flex items-center justify-center rounded-full bg-primary-50">
                <HeadphonesIcon className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  24/7 Support
                </h3>
                <p className="text-sm text-gray-600">
                  We’re always here to help you.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <CategorySection />

      {/* What We Do / Our Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              What <span className="text-primary-700">We Offer</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our commitment is to provide a comprehensive and satisfying experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl shadow-md border border-gray-100 bg-gray-50 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
              <Lightbulb className="w-10 h-10 text-accent-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Curated Selection</h3>
              <p className="text-gray-600 text-sm">Hand-picked products for quality and value.</p>
            </div>
            <div className="p-6 rounded-xl shadow-md border border-gray-100 bg-gray-50 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
              <TrendingUp className="w-10 h-10 text-accent-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">Great prices on all our items, everyday.</p>
            </div>
            <div className="p-6 rounded-xl shadow-md border border-gray-100 bg-gray-50 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
              <Shield className="w-10 h-10 text-accent-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">Shop with confidence, knowing you're getting the best.</p>
            </div>
            <div className="p-6 rounded-xl shadow-md border border-gray-100 bg-gray-50 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
              <Users className="w-10 h-10 text-accent-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dedicated Support</h3>
              <p className="text-gray-600 text-sm">Our friendly team is always ready to help you.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Our <span className="text-primary-700">Featured Products</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hand-picked selections that combine quality, innovation, and value.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="group relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image_url || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">In Stock</div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-3">{product.categories?.name || 'Category'}</p>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">4.0</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${addedProducts.has(product.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                        >
                          {addedProducts.has(product.id) ? (
                            <CheckCircle className="w-4 h-4" />
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

              <div className="text-center mt-12">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary-600 text-primary-700 font-semibold rounded-full shadow-md hover:bg-primary-50 transition-all duration-300 transform hover:scale-105"
                >
                  View All Products <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How It <span className="text-primary-700">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to get your favorite products delivered to your door.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative p-8 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border-4 border-white shadow-lg">1</div>
              <ShoppingCart className="w-16 h-16 text-primary-600 mt-8 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse & Select</h3>
              <p className="text-gray-600">Explore our wide range of products and add your favorites to the cart.</p>
            </div>
            <div className="relative p-8 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border-4 border-white shadow-lg">2</div>
              <CreditCard className="w-16 h-16 text-primary-600 mt-8 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Checkout</h3>
              <p className="text-gray-600">Complete your purchase with our secure and easy checkout process.</p>
            </div>
            <div className="relative p-8 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border-4 border-white shadow-lg">3</div>
              <Truck className="w-16 h-16 text-primary-600 mt-8 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Sit back and relax while we deliver your order right to your doorstep.</p>
            </div>
            <div className="relative p-8 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border-4 border-white shadow-lg">4</div>
              <CheckCircle className="w-16 h-16 text-primary-600 mt-8 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy Your Product</h3>
              <p className="text-gray-600">Receive your product and enjoy our quality assurance and support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Our Story: <span className="text-primary-700">Passion & Purpose</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Founded with a vision to revolutionize the online shopping experience, our store is more than just a marketplace. We believe in providing not just products, but solutions that enrich your life. Our journey began with a simple idea: to connect people with high-quality goods backed by integrity and exceptional service.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary-600 text-primary-700 font-semibold rounded-full shadow-md hover:bg-primary-50 transition-all duration-300 transform hover:scale-105"
              >
                Learn More <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="md:order-1">
              <img
                src="assets/about/aboutus.png"
                alt="About Us"
                className="rounded-xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <TestimonialSection />


      {/* Call to Action Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Ready to Start Your <span className="text-yellow-300">Shopping Journey?</span>
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Browse our extensive catalog and find exactly what you need with confidence and ease.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Explore Products <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
