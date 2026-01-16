import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Minus, MessageCircle, Mail, HelpCircle, Search, Sparkles, ArrowRight, ChevronDown } from 'lucide-react'
import { useWebsite } from '../contexts/WebsiteContext'
import { Link } from 'react-router-dom'

export default function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { websiteId } = useWebsite()

  useEffect(() => {
    document.title = 'Support & FAQ - Modern Workspace'
    if (websiteId) {
      fetchFAQs()
    }
  }, [websiteId])

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .eq('website_id', websiteId)
        .order('display_order')

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-brand-orange"></div>
      </div>
    )
  }

  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-brand-orange selection:text-white">
      
      {/* 1. Soft Minimal Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Help Center
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-[0.9] animate-slide-up">
              Common <br />
              <span className="text-gray-400">Questions.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-12 animate-slide-up delay-100 max-w-2xl">
              Everything you need to know about our products and services. 
              Can't find what you're looking for? Reach out to our team.
            </p>
            
            {/* Search Bar */}
            <div className="w-full max-w-xl relative group animate-slide-up delay-200">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-gray-100 shadow-xl focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-medium text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FAQ Accordion Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1000px] mx-auto px-6">
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or contact support.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div 
                  key={faq.id}
                  className={`group rounded-[2.5rem] border transition-all duration-500 ${
                    openIndex === index 
                      ? 'bg-white border-brand-orange/20 shadow-2xl' 
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-8 md:px-12 py-8 flex items-center justify-between text-left outline-none"
                  >
                    <h3 className={`text-xl md:text-2xl font-bold tracking-tight transition-colors ${
                      openIndex === index ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {faq.question}
                    </h3>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      openIndex === index 
                        ? 'bg-brand-orange text-white rotate-180' 
                        : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                    }`}>
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-8 md:px-12 pb-10">
                      <div className="w-full h-px bg-gray-100 mb-8"></div>
                      <p className="text-gray-500 text-lg leading-relaxed font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Soft Contact CTA */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-[#111] text-white rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Still have <br />questions?
              </h2>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                If you couldn't find what you were looking for, our dedicated support 
                team is ready to assist you with any inquiries.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/contact" className="w-full sm:w-auto px-10 py-5 bg-brand-orange text-white font-bold rounded-full hover:bg-white hover:text-black transition-all shadow-xl hover:-translate-y-1">
                  Contact Support
                </Link>
                <a href="mailto:support@modernworkspace.com" className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
                  Email Us Directly
                </a>
              </div>
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
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  )
}
