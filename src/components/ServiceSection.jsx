import React from 'react';
import { ArrowRight, CheckCircle2, Zap, Trophy, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Right Column - Visual Content */}
          <div className="w-full lg:w-1/2 relative order-2 lg:order-1">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src="assets/who.jpg"
                alt="Modern Workspace"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -right-8 bg-brand-orange text-white p-10 rounded-[2.5rem] shadow-2xl hidden md:block animate-in slide-in-from-right duration-700">
               <p className="text-5xl font-black mb-2">15+</p>
               <p className="text-sm font-bold uppercase tracking-widest opacity-80">Years of <br/> Excellence</p>
            </div>
          </div>

          {/* Left Column - Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <div className="w-10 h-[2px] bg-brand-orange"></div>
              Our Legacy
            </span>

            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
              Defining the Future of <br/> <span className="text-gray-400">Print Technology.</span>
            </h2>

            <p className="text-xl text-gray-500 leading-relaxed mb-12 max-w-xl font-medium">
              We provide industry-leading printing solutions that empower businesses to achieve more. Our curated selection of high-performance hardware and sustainable supplies ensures a seamless workflow.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                     <Zap className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 mb-1">Peak Performance</h4>
                     <p className="text-sm text-gray-500">Optimized for speed and high-volume outputs.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                     <HeartHandshake className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 mb-1">Expert Support</h4>
                     <p className="text-sm text-gray-500">24/7 dedicated assistance for your business.</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Link to="/about" className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl hover:shadow-brand-orange/20">
                Learn More
              </Link>
              <div className="flex items-center gap-3 py-4">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                       <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    ))}
                 </div>
                 <span className="text-sm font-bold text-gray-400">Trusted by 10k+ businesses</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
