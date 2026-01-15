import React, { useEffect, useState } from 'react';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

// Import Swiper styles
import 'swiper/css';

const HeroSection = () => {
  const { settings } = useSiteSettings();
  const [rightProducts, setRightProducts] = useState([]);
  const [middleProducts, setMiddleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroProducts();
  }, []);

  const fetchHeroProducts = async () => {
    try {
      const { data: rightData, error: rightError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      const { data: middleData, error: middleError } = await supabase
        .from('products')
        .select('*')
        .order('price', { ascending: false })
        .limit(8);

      if (rightError) throw rightError;
      if (middleError) throw middleError;

      setRightProducts(rightData || []);
      setMiddleProducts(middleData || []);
    } catch (error) {
      console.error('Error fetching hero products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSearch = () => {
    window.dispatchEvent(new Event('openSearch'));
  };

  return (
    <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 my-5 bg-gray-50/50">
      {/* Main Container - Rounded Corners & Soft Background */}
      <div className="bg-[#F2F7F6] rounded-[2rem] p-6 md:p-10 lg:p-12 w-full shadow-sm border border-[#e8f1f0]">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ================= LEFT COLUMN (Text Content) - NOW LARGER (Span 6) ================= */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 lg:pr-12">
            <div>
              {/* Sub-heading with Icon */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-200  backdrop-blur-sm mb-6">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                <span className="text-[10px] sm:text-sm font-bold text-brand-orange uppercase tracking-[0.2em]">
                  Official Distributor
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 !leading-[1.1] tracking-tight">
                Premium Printing <br />
                <span className="text-brand-orange">For Your Business</span>
              </h1>

              <p className="mt-8 text-xl text-gray-500 leading-relaxed max-w-lg font-medium">
                Experience the best in print technology with <strong>{settings.brand_name || 'Printer Pro'}</strong>.
                Reliable printers, quality ink, and expert support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <Link to="/shop" className="bg-brand-orange hover:bg-[#093642] text-white px-10 py-5 rounded-full font-bold transition-all duration-300 shadow-xl shadow-teal-900/20 transform hover:-translate-y-1 text-center whitespace-nowrap text-lg">
                Shop Now
              </Link>

              {/* Search Trigger Button */}
              <button
                onClick={openSearch}
                className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-10 py-5 rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 group whitespace-nowrap text-lg"
              >
                <Search className="w-6 h-6 text-gray-400 group-hover:text-brand-orange transition-colors" />
                <span>Search Products</span>
              </button>
            </div>

            {/* Expert Contact Pill */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 pr-6 rounded-full w-fit mt-4 border border-white shadow-sm">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 15}`}
                      alt="Expert"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Talk to an expert</span>
                <span className="text-xs text-gray-500 font-medium">Available 24/7</span>
              </div>
            </div>
          </div>

          {/* ================= MIDDLE COLUMN (Dynamic Slider 1) ================= */}
          <div className="lg:col-span-3 relative group hidden md:block">
            <div className="h-[320px] lg:h-[610px] w-full bg-white rounded-4xl overflow-hidden relative shadow-md transition-all duration-700 border border-gray-100">

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-brand-orange"></div>
                </div>
              ) : (
                <Swiper
                  modules={[Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  speed={1200}
                  autoplay={{
                    delay: 4500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                  }}
                  loop={middleProducts.length > 1}
                  className="h-full w-full"
                >
                  {middleProducts.map((product) => (
                    <SwiperSlide key={product.id} className="h-full w-full bg-white">
                      <Link to={`/shop/${product.id}`} className="relative block w-full h-full">

                        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-[2000ms] hover:scale-110"
                          />
                        </div>

                        {/* Product Badge */}
                        <div className="absolute top-5 left-5 right-5 z-10">
                          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-100">
                            <p className="text-[9px] text-brand-orange font-black uppercase tracking-widest mb-1">
                              Premium Choice
                            </p>
                            <p className="text-sm font-black text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-gray-500">
                              ${parseFloat(product.price).toFixed(0)}
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl text-gray-900 transition-all duration-500 hover:bg-brand-orange hover:text-white group-hover:scale-110">
                          <ArrowRight className="w-6 h-6" />
                        </div>

                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Dynamic Slider 2) ================= */}
          <div className="lg:col-span-3 flex flex-col gap-5 ">

            {/* Top Product Card */}
            <div className=" min-h-[180px] bg-white rounded-4xl relative overflow-hidden group shadow-md border border-gray-100">

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-brand-orange"></div>
                </div>
              ) : (
                <Swiper
                  modules={[Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  speed={1000}
                  autoplay={{
                    delay: 2800,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                  }}
                  loop={rightProducts.length > 1}
                  className="h-full w-full"
                >
                  {rightProducts.map((product) => (
                    <SwiperSlide key={product.id} className="h-full w-full bg-white">
                      <Link to={`/shop/${product.id}`} className="relative block w-full h-full">

                        <div className="w-full h-full overflow-hidden pt-6">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-[2000ms] ease-out hover:scale-110"
                          />
                        </div>

                        {/* Badge */}
                        <div className="absolute top-3 left-5 right-5 z-10">
                          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-100 transition-transform duration-500 hover:-translate-y-1">
                            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-brand-orange mb-1">
                              New Arrival
                            </p>
                            <p className="text-sm font-black text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-brand-orange absolute right-4 top-2 font-black text-sm">
                              ${parseFloat(product.price).toFixed(0)}
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute bottom-8 right-5 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl text-brand-orange transition-all duration-500 hover:bg-brand-orange hover:text-white group-hover:-translate-x-2">
                          <ArrowRight className="w-4 h-4" />
                        </div>

                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            {/* Bottom Offer Card */}
            <div className=" h-[200px] bg-brand-orange rounded-4xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-md">

              <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-bl-[80px] transition-all duration-700 group-hover:w-36 group-hover:h-36 group-hover:bg-white/10"></div>

              <div>
                <div className="inline-block px-4 py-1 bg-white/10 text-white text-[10px] font-black tracking-widest rounded-full mb-3 uppercase">
                  Seasonal Deal
                </div>
                <h3 className="text-2xl font-black text-white mb-1 italic">
                  25% OFF
                </h3>
                <p className="text-teal-100 text-xs max-w-[200px]">
                  Upgrade your lifestyle with our most popular picks.
                </p>
              </div>

              <Link
                to="/shop"
                className="flex items-center gap-3 text-white font-black text-sm uppercase tracking-wider group-hover:gap-5 transition-all duration-500"
              >
                Explore Now <ArrowRight className="w-5 h-5" />
              </Link>

            </div>
          </div>


        </div>
      </div>

    </section>
  );
};

export default HeroSection;