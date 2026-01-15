import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="w-full  mx-auto px-4 sm:px-6 lg:px-32">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">

          {/* Left Column - Image */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-[600px]">
            <img
              src="assets/who.jpg"
              alt="Premium Printing Technology"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-sm"
            />
          </div>

          {/* Right Column - Content Card */}
          <div className="w-full lg:w-1/2 bg-white rounded-3xl p-8 md:p-12 lg:p-20 shadow-sm flex flex-col justify-center items-start">
            <span className="text-brand-orange font-bold text-sm tracking-widest uppercase mb-6">
              — Who We Are
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-8">
              Advanced Printing <br /> Solutions for Business
            </h2>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl font-medium">
              We specialize in high-performance printing ecosystems tailored for modern enterprises. From industrial-grade hardware to eco-friendly ink supplies, our comprehensive range ensures your business never stops moving. Experience reliability, speed, and exceptional quality with every print.
            </p>

            <Link to="/about" className="group flex items-center gap-3 bg-brand-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-sm tracking-wider transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
              LEARN MORE
              <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceSection;