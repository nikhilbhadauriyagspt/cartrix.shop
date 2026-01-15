import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Aboutpage from '../components/ServiceSection'

import {
  ShoppingCart, ArrowRight, CheckCircle, Truck, Shield, Star, ChevronRight, HeadphonesIcon, Award, Package, Heart, Printer, Droplet, Monitor, Wrench
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../contexts/ToastContext'
import TestimonialSection from '../components/TestimonialSection'
import HeroSection from '../components/HeroSection'

// Helper function to generate URL-friendly slugs (matching Shop.jsx)
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [premiumCollection, setPremiumCollection] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedProducts, setAddedProducts] = useState(new Set())
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()

  useEffect(() => {
    document.title = 'Home - Premium Printing Solutions'
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: featured } = await supabase
        .from('products')
        .select(`*, categories (name)`)
        .order('created_at', { ascending: false })
        .limit(8)

      const { data: newProds } = await supabase
        .from('products')
        .select(`*, categories (name)`)
        .order('created_at', { ascending: false })
        .range(8, 16)

      const { data: premium } = await supabase
        .from('products')
        .select(`*, categories (name)`)
        .order('price', { ascending: false })
        .limit(4)

      const { data: catsData, error: catsError } = await supabase
        .from('categories')
        .select('id, name, description, slug, products(id)')
        .order('name')

      if (catsError) throw catsError;

      const validCategories = (catsData || [])
        .map(cat => ({
          ...cat,
          productCount: cat.products?.length || 0
        }))
        .filter(cat => cat.productCount > 0)

      setFeaturedProducts(featured || [])
      setNewArrivals(newProds || [])
      setPremiumCollection(premium || [])
      setCategories(validCategories)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product, e) => {
    e?.preventDefault()
    e?.stopPropagation()
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

  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('ink')) return Droplet;
    if (n.includes('printer')) return Printer;
    if (n.includes('paper')) return Package;
    if (n.includes('toner')) return Monitor;
    if (n.includes('part') || n.includes('service')) return Wrench;
    return Package;
  }

  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden">

      <HeroSection />

      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 mt-10 mb-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange transition-transform hover:scale-110">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-900">Free Shipping</h3>
              <p className="text-xs text-gray-500">On all orders over $99</p>
            </div>
          </div>
          <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-transform hover:scale-110">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-900">Secure Payment</h3>
              <p className="text-xs text-gray-500">100% protected transactions</p>
            </div>
          </div>
          <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 transition-transform hover:scale-110">
              <HeadphonesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-900">24/7 Support</h3>
              <p className="text-xs text-gray-500">Dedicated expert team</p>
            </div>
          </div>
          <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 transition-transform hover:scale-110">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-900">Quality Guarantee</h3>
              <p className="text-xs text-gray-500">Certified authentic products</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 mb-12">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Departments</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Browse Categories</h2>
            </div>
            <Link to="/categories" className="text-sm font-bold text-brand-orange hover:text-orange-700 flex items-center gap-2 transition-all">
              VIEW ALL <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <Link
                  key={cat.id || idx}
                  to={`/shop/category/${cat.slug || generateSlug(cat.name)}`}
                  className="group flex items-center gap-4 pl-4 pr-6 py-4 rounded-full bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-md transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 transform group-hover:rotate-12 flex-shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-brand-orange transition-colors truncate">{cat.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                      {cat.productCount} Items
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="w-4 h-4 text-brand-orange" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#fafafa]">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Selected For You</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Trending Now</h2>
            <p className="text-gray-500 text-lg">Discover our most popular products, curated just for you based on quality and performance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className="group bg-white rounded-[2rem] p-4 transition-all duration-500 hover:shadow-lg hover:-translate-y-2 relative border border-transparent hover:border-gray-100"
              >
                <div className="relative aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-5">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWishlist(product.id)) {
                          removeFromWishlist(product.id);
                          addToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist(product.id);
                          addToast('Added to wishlist', 'success');
                        }
                      }}
                      className={`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all duration-300 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${addedProducts.has(product.id) ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-brand-orange'
                      }`}
                  >
                    {addedProducts.has(product.id) ? <CheckCircle className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                    {addedProducts.has(product.id) ? 'Added' : 'Add to Cart'}
                  </button>
                </div>
                <div className="px-2 pb-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{product.categories?.name || 'Accessory'}</p>
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 min-h-[50px] leading-snug group-hover:text-brand-orange transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                    <span className="text-xl font-black text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-gray-400">4.8</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-20">
            <Link to="/shop" className="inline-block px-10 py-4 rounded-full border-2 border-gray-900 text-gray-900 font-bold text-sm uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              View Full Collection
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0e4b5b] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1 flex flex-col justify-center text-white">
              <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-4">The Gold Standard</span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Premium <br /> Collection</h2>
              <p className="text-teal-100 text-lg mb-8 leading-relaxed">
                Elevate your office with our top-tier selection. Engineered for heavy-duty performance and professional-grade results.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-3 text-white font-bold uppercase tracking-wider hover:gap-5 transition-all">
                Shop Premium <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {premiumCollection.map((product) => (
                <Link
                  key={product.id}
                  to={`/shop/${product.id}`}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:bg-white hover:scale-[1.02] group transition-all duration-500 shadow-none hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-white flex-shrink-0 overflow-hidden p-2">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm mb-1 line-clamp-1 group-hover:text-gray-900 transition-colors">{product.name}</h3>
                      <p className="text-teal-200 text-xs mb-3 group-hover:text-gray-500">Professional Series</p>
                      <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                        ${parseFloat(product.price).toFixed(0)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWishlist(product.id)) {
                          removeFromWishlist(product.id);
                          addToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist(product.id);
                          addToast('Added to wishlist', 'success');
                        }
                      }}
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'bg-white text-red-500 shadow-md' : 'text-teal-200 hover:bg-white/20'}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Aboutpage />

      <section className="py-24 bg-white overflow-hidden">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Just In</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Fresh Arrivals</h2>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="h-1 w-12 bg-gray-100 rounded-full"></div>
              <div className="h-1 w-4 bg-brand-orange rounded-full"></div>
            </div>
          </div>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={1.2}
            loop={true}
            speed={1000}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1440: { slidesPerView: 4.2 },
            }}
            className="overflow-visible"
          >
            {newArrivals.map((product) => (
              <SwiperSlide key={product.id}>
                <Link
                  to={`/shop/${product.id}`}
                  className="group block bg-white rounded-[2.5rem] border border-gray-100 p-6 hover:shadow-lg hover:border-brand-orange/20 transition-all duration-500 h-full"
                >
                  <div className="relative aspect-[4/3] rounded-[2rem] bg-gray-50 overflow-hidden mb-6">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">New</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWishlist(product.id)) {
                          removeFromWishlist(product.id);
                          addToast('Removed from wishlist', 'success');
                        } else {
                          addToWishlist(product.id);
                          addToast('Added to wishlist', 'success');
                        }
                      }}
                      className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate group-hover:text-brand-orange transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-[40px]">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-brand-orange">${parseFloat(product.price).toFixed(2)}</span>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#F2F7F6] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
              <div className="order-2 md:order-1">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white text-brand-orange text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                  Our Promise
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-[1.1]">
                  Quality you can trust, <br /> Service you deserve.
                </h2>
                <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                  We don't just sell printers; we provide complete printing ecosystems designed for efficiency. From high-capacity ink to industrial-grade hardware, every product is vetted for performance.
                </p>
                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white hover:bg-white transition-colors shadow-sm hover:shadow-md">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-brand-orange" />
                    </div>
                    <span className="text-gray-900 font-bold">Authentic Manufacturer Warranty</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white hover:bg-white transition-colors shadow-sm hover:shadow-md">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-brand-orange" />
                    </div>
                    <span className="text-gray-900 font-bold">Lifetime Technical Support</span>
                  </div>
                </div>
                <Link to="/about" className="text-brand-orange font-black text-sm uppercase tracking-wider border-b-2 border-brand-orange pb-1 hover:text-orange-700 hover:border-orange-700 transition-all">
                  Read Our Full Story
                </Link>
              </div>
              <div className="relative order-1 md:order-2">
                <div className=" rounded-[2rem] overflow-hidden shadow-lg transform transition-transform hover:rotate-0 duration-700">
                  <img
                    src="assets/promise.jpg"
                    alt="Workspace"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2rem] shadow-xl max-w-[240px] animate-bounce-slow">
                  <p className="text-4xl font-black text-gray-900 mb-2">15k+</p>
                  <p className="text-sm text-gray-500 leading-snug font-medium">Happy customers trusting our printing solutions worldwide.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialSection />

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Stay in the loop</h2>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto font-medium">
            Subscribe to our newsletter for exclusive offers, new product announcements, and expert printing tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-gray-50 border-2 border-gray-100 text-gray-900 text-sm rounded-full px-8 py-4 focus:outline-none focus:border-brand-orange focus:ring-0 transition-all font-medium placeholder:text-gray-400"
            />
            <button className="bg-black text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-brand-orange transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1">
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-6 font-medium">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </section>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}