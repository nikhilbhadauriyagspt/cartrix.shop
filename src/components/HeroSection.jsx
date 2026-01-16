import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatImageUrl } from '../utils/formatUrl';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoRotateRef = useRef(null);

  useEffect(() => {
    fetchHeroProducts();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0) return;
    startAutoRotate();
    return () => stopAutoRotate();
  }, [activeIndex, loading, products.length]);

  const startAutoRotate = () => {
    stopAutoRotate();
    autoRotateRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const stopAutoRotate = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  };

  const fetchHeroProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('price', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProducts(data || []);
      setActiveIndex(Math.floor((data?.length || 0) / 2));
    } catch (error) {
      console.error('Error fetching hero products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const getSlideStyles = (index) => {
    const total = products.length;
    let diff = (index - activeIndex + total + total / 2) % total - total / 2;

    // Normalize diff
    if (diff < -Math.floor(total / 2)) diff += total;
    if (diff > Math.floor(total / 2)) diff -= total;

    const isCenter = diff === 0;
    const isLeft = diff === -1;
    const isRight = diff === 1;

    let zIndex = 0;
    let opacity = 0;
    let transform = 'translateX(0) scale(0.5)';
    let pointerEvents = 'none';

    if (isCenter) {
      zIndex = 30;
      opacity = 1;
      transform = 'translateX(0) scale(1)';
      pointerEvents = 'auto';
    } else if (isLeft) {
      zIndex = 20;
      opacity = 1;
      // Increased offset to 150%
      transform = 'translateX(-150%) scale(1)';
    } else if (isRight) {
      zIndex = 20;
      opacity = 1;
      // Increased offset to 150%
      transform = 'translateX(150%) scale(1)';
    } else {
      opacity = 0;
      zIndex = 10;
      if (diff < 0) transform = 'translateX(-150%) scale(0.5)';
      else transform = 'translateX(150%) scale(0.5)';
    }

    return { zIndex, opacity, transform, pointerEvents, isCenter };
  };

  return (
    <section className="relative w-full bg-white overflow-hidden py-10 lg:py-16 font-sans selection:bg-gray-900 selection:text-white">

      <div className="container mx-auto px-4 mb-8 text-center relative z-10">
        <h1 className="text-3xl md:text-7xl font-bold  !leading-[85px] text-gray-900 mb-4">
          Everything You Need <br className="hidden sm:block" />
          for a <span className="text-gray-400">Modern Workspace</span>
        </h1>
        {/* <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
          Upgrade your office with our premium selection of high-performance printing solutions.
        </p> */}
      </div>

      <div className="relative w-full max-w-[1800] mx-auto h-[500px] flex items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">

            {/* DYNAMIC PRODUCTS CONTAINER */}
            <div className="relative w-[400px] h-full flex flex-col items-center justify-center perspective-1000 z-20">
              {/* Image Slider Area */}
              <div className="relative w-full h-[350px] flex items-center justify-center">
                {products.map((product, index) => {
                  const { zIndex, opacity, transform, pointerEvents, isCenter } = getSlideStyles(index);

                  return (
                    <div
                      key={product.id}
                      className="absolute top-0 left-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center justify-center"
                      style={{
                        zIndex,
                        opacity,
                        transform,
                        pointerEvents
                      }}
                    >
                      <Link
                        to={`/shop/${product.id}`}
                        className="relative flex items-center justify-center w-full h-full"
                        onClick={(e) => !isCenter && e.preventDefault()}
                      >
                        {/* Image Wrapper */}
                        <div className={`
                                                          relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                                                          ${isCenter
                            ? 'w-[380px] h-[300px] bg-transparent' // Center: Reduced height, transparent, visible overflow
                            : 'w-[280px] h-[280px] rounded-full bg-gray-100 overflow-hidden grayscale-[0.5] opacity-80' // Side: Circle, Gray BG, Clipped
                          }
                                                      `}>
                          <img
                            src={formatImageUrl(product.image_url)}
                            alt={product.name}
                            className={`
                                                  object-contain transition-all duration-700
                                                  ${isCenter
                                ? 'w-full h-full mix-blend-multiply scale-100'
                                : 'w-[80%] h-[80%] mix-blend-multiply hover:scale-110'
                              }
                                                `}
                          />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* FIXED CONTENT AREA (Updates based on activeIndex) */}
              <div className="mt-8 text-center w-full px-4 min-h-[160px]">
                {products[activeIndex] && (
                  <div className="animate-in fade-in duration-500">
                    <h3 className="text-xl font-medium text-gray-900 mb-1">
                      {products[activeIndex].name}
                    </h3>
                    <p className="text-lg font-medium text-gray-500 mb-4">
                      ${parseFloat(products[activeIndex].price).toFixed(2)}
                    </p>
                    <Link 
                      to={`/shop/${products[activeIndex].id}`}
                      className="inline-block px-8 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all hover:scale-105"
                    >
                      Shop Now
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Buttons - Flanking the center 400px box */}
              <button
                onClick={() => { handlePrev(); stopAutoRotate(); }}
                className="absolute -left-40 top-[35%] -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center text-gray-900"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => { handleNext(); stopAutoRotate(); }}
                className="absolute -right-40 top-[35%] -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center text-gray-900"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;