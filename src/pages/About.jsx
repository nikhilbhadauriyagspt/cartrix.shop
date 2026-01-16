import { useEffect } from 'react'
import {
  Target, Eye, Gem, Shield, Zap, Heart, CheckCircle, Users,
  Package, Truck, Smile, ShieldCheck, Award, Globe,
  History, Sparkles, Coffee, HeartHandshake, ArrowRight,
  MoveDown, Star, Leaf, Fingerprint, Compass
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function About() {
  const { settings } = useSiteSettings()

  useEffect(() => {
    document.title = `Our Story - ${settings.brand_name || 'Modern Workspace'}`
    window.scrollTo(0, 0)
  }, [settings])

  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-brand-orange selection:text-white">
      
      {/* 1. Soft Minimal Hero */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Our Journey
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1] animate-slide-up">
              Redefining the <br />
              <span className="text-gray-400">Modern Workspace.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed mb-8 animate-slide-up delay-100">
              We believe that the tools you use should be as inspired as the work you create. 
              Since 2010, we've been bridge the gap between technology and creativity.
            </p>
            <div className="animate-bounce-slow">
              <MoveDown className="w-6 h-6 text-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Soft Vision Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative group">
              <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img 
                  src="assets/about/aboutus.png" 
                  alt="Our Vision" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 flex flex-col justify-center animate-float">
                <div className="text-3xl font-black text-brand-orange mb-1">15+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Years of Innovation</div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.3em] block">The Vision</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  Where technology <br />meets human touch.
                </h2>
              </div>
              
              <p className="text-gray-500 text-lg leading-relaxed font-medium">
                Our story didn't start in a boardroom; it started with a simple question: 
                Why is high-end printing technology so inaccessible to the creative individual? 
                We set out to change that, one pixel and one drop of ink at a time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-orange">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Unique Approach</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">Tailored solutions for every unique workspace need.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-500">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Sustainable Future</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">Committed to eco-friendly printing and reduced waste.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Soft Stats - Clean & Airy */}
      <section className="py-20 bg-[#F9FAFB] border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Products Delivered', value: '120k+', suffix: 'units' },
              { label: 'Happy Creators', value: '45k+', suffix: 'users' },
              { label: 'Support Team', value: '24/7', suffix: 'always' },
              { label: 'Global Offices', value: '12', suffix: 'cities' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Values - Large Soft Cards */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Our Core Values</h2>
            <p className="text-gray-500 font-medium">The principles that guide every decision we make.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Compass, 
                title: "Curated Excellence", 
                desc: "We don't just sell everything; we sell the right things. Every product in our catalog is hand-picked and tested.",
                bg: "bg-blue-50",
                color: "text-blue-600"
              },
              { 
                icon: Heart, 
                title: "Customer First", 
                desc: "Your success is our success. Our support team consists of experts, not just representatives.",
                bg: "bg-red-50",
                color: "text-red-600"
              },
              { 
                icon: Zap, 
                title: "Constant Innovation", 
                desc: "The world of printing never stops evolving, and neither do we. We stay ahead so you don't have to.",
                bg: "bg-orange-50",
                color: "text-orange-600"
              }
            ].map((value, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-white border border-gray-100 hover:shadow-2xl hover:border-transparent transition-all duration-500">
                <div className={`w-16 h-16 rounded-[1.5rem] ${value.bg} ${value.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Soft Journey Section */}
      <section className="py-24 lg:py-32 bg-[#111] text-white overflow-hidden rounded-[4rem] mx-4 lg:mx-10 my-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.3em] block">The History</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  A decade of <br />evolution.
                </h2>
              </div>

              <div className="space-y-12 relative border-l border-white/10 pl-10 ml-4">
                {[
                  { year: '2010', title: 'The Garage Days', desc: 'Started with a single mission: Better ink, better results.' },
                  { year: '2015', title: 'Hardware Revolution', desc: 'Expanded into professional-grade printing equipment.' },
                  { year: '2020', title: 'Global Reach', desc: 'Launched our international platform serving creators worldwide.' },
                  { year: '2025', title: 'The Next Chapter', desc: 'Pioneering smart, sustainable workspace solutions.' }
                ].map((step, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[51px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-black group-hover:bg-brand-orange transition-colors"></div>
                    <div className="text-brand-orange font-black text-xl mb-1">{step.year}</div>
                    <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] border border-white/10">
                <img 
                  src="assets/about/aboutside.png" 
                  alt="Our History" 
                  className="w-full h-full object-cover opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Soft CTA */}
      <section className="py-32 text-center">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <HeartHandshake className="w-12 h-12 text-brand-orange mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              Let's create something <br />extraordinary together.
            </h2>
            <p className="text-gray-500 font-medium mb-12">
              Our team is ready to help you find the perfect tools for your next big project. 
              Join thousands of creators who trust us.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact" className="px-10 py-5 bg-black text-white font-bold rounded-full hover:bg-brand-orange transition-all shadow-xl hover:-translate-y-1">
                Get in Touch
              </Link>
              <Link to="/shop" className="px-10 py-5 bg-gray-50 text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all">
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
      `}</style>
    </div>
  )
}
