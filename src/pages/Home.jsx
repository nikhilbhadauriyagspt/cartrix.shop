import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import HeroSection from '../components/HeroSection'
import ServiceSection from '../components/ServiceSection'
import TestimonialSection from '../components/TestimonialSection'
import RecentlyViewed from '../components/RecentlyViewed'
import { ArrowRight, Star, ArrowUpRight, Truck, ShieldCheck, Clock, Award, Mail, Printer, Droplet, Layers, FileText, Settings, Wrench, Heart, ShoppingCart, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useToast } from '../contexts/ToastContext'
import { formatImageUrl } from '../utils/formatUrl'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const generateSlug = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
};

const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('ink')) return Droplet;
  if (n.includes('printer')) return Printer;
  if (n.includes('paper')) return FileText;
  if (n.includes('toner')) return Layers;
  if (n.includes('part') || n.includes('service')) return Wrench;
  return Settings;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [inkProducts, setInkProducts] = useState([])
  const [printerProducts, setPrinterProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedProducts, setAddedProducts] = useState(new Set())
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToast } = useToast()

  useEffect(() => {
    document.title = 'Home - Modern Workspace Solutions'
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 1. Trending (General)
      const { data: featured } = await supabase
        .from('products')
        .select(`*, categories (name)`)
        .order('created_at', { ascending: false })
        .limit(10)

      // 2. Specific Category: Inkjet Printers
      const { data: ink } = await supabase
        .from('products')
        .select(`*, categories!inner(name)`)
        .eq('category_id', '756dd52d-442e-407d-9a5c-7324499bf14b')
        .limit(8)

      // 3. Specific Category: Printers (Example)
      const { data: printers } = await supabase
        .from('products')
        .select(`*, categories!inner(name)`)
        .ilike('categories.name', '%printer%')
        .limit(4)

      const { data: catsData } = await supabase
        .from('categories')
        .select('id, name, slug, products(count)')
        .limit(12)

      setFeaturedProducts(featured || [])
      setInkProducts(ink || [])
      setPrinterProducts(printers || [])
      setCategories(catsData || [])
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

      // Keep "Added" state for 2 seconds
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
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-brand-orange selection:text-white">

      <HeroSection />

      {/* Marquee */}
      <div className="relative py-8 bg-black overflow-hidden border-y border-gray-800">
        <div className="whitespace-nowrap animate-marquee flex gap-16 text-gray-500 font-bold text-sm uppercase tracking-[0.2em]">
          <span>Premium Quality</span><span>•</span>
          <span>Fast Shipping</span><span>•</span>
          <span>Expert Support</span><span>•</span>
          <span>Official Warranty</span><span>•</span>
          <span>Premium Quality</span><span>•</span>
          <span>Fast Shipping</span><span>•</span>
          <span>Expert Support</span><span>•</span>
          <span>Official Warranty</span>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Official Warranty", desc: "Guaranteed authentic products." },
              { icon: Truck, title: "Fast Delivery", desc: "Free shipping over $150." },
              { icon: Clock, title: "24/7 Support", desc: "Expert assistance anytime." },
              { icon: Award, title: "Premium Quality", desc: "Certified high performance." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-start p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid (Enhanced) */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Shop by Category</h2>
            <Link to="/categories" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-brand-orange hover:border-brand-orange transition-colors">
              View All
            </Link>
          </div>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 7 },
            }}
            className="pb-10"
          >
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <SwiperSlide key={cat.id}>
                  <Link
                    to={`/shop/category/${cat.slug || generateSlug(cat.name)}`}
                    className="group relative bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border border-gray-100 hover:border-transparent aspect-square h-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                      <Icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-brand-orange transition-colors">{cat.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{cat.products?.[0]?.count || '0'} Items</p>

                    <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <ArrowRight className="w-5 h-5 text-brand-orange" />
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })}
          </Swiper>        </div>
      </section>

      {/* Trending Now (1+4 Grid) */}
      <section className="py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-widest mb-3 block">Curated Selection</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Trending Now</h2>
            <p className="text-gray-500 text-lg">Our most popular picks for the modern office.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Product Slider (Dynamic) */}
            <div className="h-full min-h-[500px]">
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={featuredProducts.length > 1}
                className="h-full rounded-[2.5rem] overflow-hidden shadow-sm"
              >
                {featuredProducts.slice(0, 5).map((product) => (
                  <SwiperSlide key={product.id}>
                    <div className="group relative bg-[#F5F5F7] p-8 md:p-12 flex flex-col justify-between h-full">
                      <div className="absolute top-0 left-0 p-8 z-10 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (isInWishlist(product.id)) {
                              removeFromWishlist(product.id);
                              addToast('Removed from wishlist', 'success');
                            } else {
                              addToWishlist(product.id);
                              addToast('Added to wishlist', 'success');
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        >
                          <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 p-8 z-10">
                        <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Top Rated</span>
                      </div>
                      <div className="relative w-full flex-1 flex items-center justify-center mb-8">
                        <img
                          src={formatImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-full h-full max-h-[400px] object-contain relative z-10 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black mb-2 leading-tight group-hover:text-brand-orange transition-colors">
                          <Link to={`/shop/${product.id}`}>{product.name}</Link>
                        </h3>
                        <div className="flex items-center justify-between mt-4 border-t border-gray-200 pt-6">
                          <span className="text-2xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={addedProducts.has(product.id)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${addedProducts.has(product.id)
                              ? 'bg-green-500 text-white scale-110'
                              : 'bg-black text-white hover:bg-brand-orange'
                              }`}
                          >
                            {addedProducts.has(product.id) ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <ShoppingCart className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Grid Products (Remaining) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredProducts.slice(5, 9).map((product) => (
                <div key={product.id} className="group bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-500 hover:border-transparent">
                  <div className="relative aspect-square bg-[#F9FAFB] rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={formatImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-[80%] h-[80%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          if (isInWishlist(product.id)) {
                            removeFromWishlist(product.id);
                            addToast('Removed from wishlist', 'success');
                          } else {
                            addToWishlist(product.id);
                            addToast('Added to wishlist', 'success');
                          }
                        }}
                        className={`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={addedProducts.has(product.id)}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${addedProducts.has(product.id)
                        ? 'bg-green-500 text-white translate-y-0 opacity-100'
                        : 'bg-white text-gray-900 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-black hover:text-white'
                        }`}
                    >
                      {addedProducts.has(product.id) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors">
                      <Link to={`/shop/${product.id}`}>{product.name}</Link>
                    </h4>
                    <span className="text-lg font-black text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Ink Essentials */}
      {inkProducts.length > 0 && (
        <section className="py-24 bg-black text-white overflow-hidden">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative">
              <div>
                <span className="text-brand-orange font-bold text-xs uppercase tracking-widest mb-2 block text-teal-500">Professional Series</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">Premium Inkjet Printers</h2>
              </div>
              <Link to="/shop?category=756dd52d-442e-407d-9a5c-7324499bf14b" className="px-8 py-3 border border-white/20 rounded-full font-bold hover:bg-white hover:text-black transition-all">
                Shop All Inkjet
              </Link>

              {/* Slider Navigation */}
              <div className="flex gap-3 mb-1">
                <button className="ink-prev w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="ink-next w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={24}
              slidesPerView={1.2}
              navigation={{
                prevEl: '.ink-prev',
                nextEl: '.ink-next',
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                1024: { slidesPerView: 3.2 },
                1440: { slidesPerView: 4 },
              }}
              className="!overflow-visible"
            >
              {inkProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between h-full">
                    <Link to={`/shop/${product.id}`} className="block">
                      <div className="aspect-square bg-white/5 rounded-2xl mb-6 flex items-center justify-center p-4 relative overflow-hidden">
                        <img
                          src={formatImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-screen opacity-90 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-brand-orange transition-colors">{product.name}</h3>
                      <p className="text-brand-orange font-bold text-xl">${parseFloat(product.price).toFixed(2)}</p>
                    </Link>
                    <div className="mt-6 flex items-center gap-3">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={addedProducts.has(product.id)}
                        className={`flex-1 h-12 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${addedProducts.has(product.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-black hover:bg-brand-orange hover:text-white'
                          }`}
                      >
                        {addedProducts.has(product.id) ? (
                          <>
                            <Check className="w-5 h-5" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isInWishlist(product.id)) {
                            removeFromWishlist(product.id);
                            addToast('Removed from wishlist', 'success');
                          } else {
                            addToWishlist(product.id);
                            addToast('Added to wishlist', 'success');
                          }
                        }}
                        className={`w-12 h-12 rounded-full border border-white/20 flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'bg-red-500 border-transparent text-white' : 'text-white hover:bg-white/10'}`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* New Section: Printer Selection */}
      {printerProducts.length > 0 && (
        <section className="py-24">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Best-Selling Printers</h2>
              <Link to="/shop?category=printers" className="font-bold text-sm border-b-2 border-black pb-1 hover:text-brand-orange hover:border-brand-orange transition-colors mt-4 md:mt-0">View All Models</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {printerProducts.slice(0, 2).map((product) => (
                <div key={product.id} className="group relative bg-[#F5F5F7] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gray-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                        addToast('Removed from wishlist', 'success');
                      } else {
                        addToWishlist(product.id);
                        addToast('Added to wishlist', 'success');
                      }
                    }}
                    className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm z-10 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                  <div className="w-full md:w-1/2 aspect-square flex items-center justify-center">
                    <img
                      src={formatImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Professional Grade</span>
                    <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-brand-orange transition-colors">
                      <Link to={`/shop/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p className="text-gray-500 mb-6 line-clamp-2">{product.description || 'High-efficiency printing solution for your business needs.'}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={addedProducts.has(product.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${addedProducts.has(product.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-black text-white hover:bg-brand-orange'
                          }`}
                      >
                        {addedProducts.has(product.id) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed />
      <ServiceSection />
      <TestimonialSection />

      {/* Newsletter */}
      <section className="py-24 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          <Mail className="w-12 h-12 mx-auto mb-6 text-gray-900" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-gray-900">
            Join the Inner Circle
          </h2>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            Get early access to new drops, exclusive discounts, and expert tips delivered straight to your inbox.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-black transition-colors text-center sm:text-left"
            />
            <button className="px-8 py-4 bg-black text-white font-bold rounded-full text-sm uppercase tracking-wider hover:bg-brand-orange transition-colors shadow-lg">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  )
}
