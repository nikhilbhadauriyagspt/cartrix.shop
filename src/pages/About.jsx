import { useEffect } from 'react'
import {
  Target, Eye, Gem, Shield, Zap, Heart, CheckCircle, Users,
  Package, Truck, Smile, ShieldCheck, Award, Globe,
  History, Sparkles, Coffee, HeartHandshake, ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function About() {
  const { settings } = useSiteSettings()

  useEffect(() => {
    document.title = `Our Story - ${settings.brand_name || 'Premium Printers'}`
    window.scrollTo(0, 0)
  }, [settings])

  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden">

      {/* 1. Enhanced Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-56 lg:pb-40 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white">
        <div className="w-full max-w-[1800px] mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-orange-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-10 animate-fade-in">
            <Sparkles className="w-3 h-3" />
            Since 2010
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 tracking-tighter leading-[0.95] max-w-5xl mx-auto">
            Crafting the Future of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-600">Printing.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
            We don't just sell hardware. We provide the heartbeat of your creative and professional workflow through curated technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="px-10 py-4 bg-black text-white font-bold rounded-full hover:bg-brand-orange transition-all shadow-lg hover:shadow-orange-200 transform hover:-translate-y-1">
              Explore Catalog
            </Link>
            <div className="flex items-center gap-2 text-gray-400 px-6 py-4 font-bold uppercase text-[10px] tracking-widest">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Verified Partner
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-orange/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/30 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4"></div>
      </section>

      {/* 2. Interactive Stats Grid */}
      <section className="py-20 bg-white relative z-20 -mt-10">
        <div className="w-full max-w-[1800px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Happy Clients', value: '50K+', icon: Users, color: 'text-blue-600' },
              { label: 'Years Active', value: '15+', icon: History, color: 'text-brand-orange' },
              { label: 'Global Brands', value: '100+', icon: Globe, color: 'text-purple-600' },
              { label: 'Success Rate', value: '99%', icon: Award, color: 'text-green-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Philosophy - Enhanced Split */}
      <section className="py-32">
        <div className="w-full max-w-[1800px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className=" gap-6 relative">
              <img src="assets/about/aboutside.png" width='100%' alt="" />

              {/* Floating Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-2xl animate-spin-slow">
                <div className="text-center">
                  <div className="font-black text-2xl tracking-tighter leading-none">PRO</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest">Standard</div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-brand-orange font-bold text-xs uppercase tracking-widest mb-6">
                <Target className="w-4 h-4" /> OUR PHILOSOPHY
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                Simplicity is the <br />ultimate sophistication.
              </h2>
              <div className="space-y-8">
                {[
                  { icon: Zap, title: "Efficiency First", desc: "We optimize every product for speed and reliability, ensuring zero downtime for your projects." },
                  { icon: ShieldCheck, title: "Unwavering Quality", desc: "Every unit undergoes a rigorous 24-hour stress test before it leaves our facility." },
                  { icon: HeartHandshake, title: "Human Support", desc: "No bots. Talk to real printing experts who understand your unique challenges." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-all duration-300">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Journey - Modern Timeline */}
      <section className="py-32 bg-gray-50/50 overflow-hidden">
        <div className="w-full max-w-[1800px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Our Evolution</h2>
            <p className="text-gray-500 font-medium text-lg">From a small workshop to a global printing authority.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              { year: '2010', title: 'The Genesis', desc: 'Started in a small garage with a focus on specialized ink supplies.' },
              { year: '2014', title: 'Expansion', desc: 'Opened our first physical showroom and expanded into high-end hardware.' },
              { year: '2018', title: 'Going Global', desc: 'Launched our international logistics hub serving over 50 countries.' },
              { year: '2025', title: 'The Future', desc: 'Pioneering AI-integrated printing ecosystems for the modern office.' }
            ].map((m, i) => (
              <div key={i} className="relative p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-brand-orange/20 transition-all group">
                <div className="text-5xl font-black text-gray-100 absolute top-6 right-6 group-hover:text-brand-orange/10 transition-colors">
                  {m.year}
                </div>
                <div className="relative z-10 pt-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{m.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Values & Ethics */}
      <section className="py-32 bg-white">
        <div className="w-full max-w-[1800px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <div className="w-16 h-1 w-16 bg-brand-orange mb-8 rounded-full"></div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8 tracking-tight leading-none">What We <br />Stand For.</h2>
                <p className="text-gray-500 font-medium leading-relaxed text-lg mb-10">
                  Integrity isn't just a word for us; it's the foundation of every interaction we have with our clients and partners.
                </p>
                <div className="flex items-center gap-4 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <Coffee className="w-8 h-8 text-brand-orange" />
                  <div>
                    <div className="font-bold text-gray-900">Always On</div>
                    <div className="text-xs text-gray-500 font-medium">Global support team available 24/7</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
              {[
                { title: 'Innovation', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
                { title: 'Quality', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
                { title: 'Support', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
                { title: 'Integrity', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
                { title: 'Eco-Minded', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                { title: 'Unity', icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-50' }
              ].map((v, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] border border-gray-50 bg-[#F9FAFB] hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-500 group">
                  <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <v.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">{v.title}</h4>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    Excellence in every detail, ensuring our clients receive nothing but the absolute best in printing technology.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action - The Grand Finale */}
      <section className="py-24">
        <div className="w-full max-w-[1800px] mx-auto px-6">
          <div className="relative bg-black rounded-[4rem] p-12 md:p-24 overflow-hidden text-center">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[120px]"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">
                Ready to elevate your <br /><span className="text-brand-orange">printing game?</span>
              </h2>
              <p className="text-gray-400 text-xl font-medium mb-12">
                Join 50,000+ satisfied clients who trust us for their professional and creative needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/shop" className="px-12 py-5 bg-brand-orange text-white font-black rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-105 shadow-2xl">
                  SHOP THE COLLECTION
                </Link>
                <Link to="/contact" className="px-12 py-5 bg-white/10 backdrop-blur-md text-white font-black rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                  CONTACT US <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}