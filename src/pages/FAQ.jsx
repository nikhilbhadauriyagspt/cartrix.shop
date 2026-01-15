import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Minus, MessageCircle, Mail, HelpCircle } from 'lucide-react'
import { useWebsite } from '../contexts/WebsiteContext'
import { Link } from 'react-router-dom'

export default function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsite()

  useEffect(() => {
    document.title = 'FAQ - Frequently Asked Questions'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-brand-orange mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 bg-[#F2F7F6]">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 text-center relative z-10">
          <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-4 block animate-fade-in">
            Support Center
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            How can we <span className="text-brand-orange">help you?</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Browse our most frequently asked questions to find quick answers about your orders, shipping, and product details.
          </p>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* 2. FAQ List */}
      <section className="py-24">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          
          {faqs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] max-w-4xl mx-auto">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No FAQs Available</h3>
              <p className="text-gray-500">Please check back later or contact our support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {faqs.map((faq, index) => (
                <div 
                  key={faq.id}
                  className={`group rounded-[2rem] transition-all duration-300 border border-transparent h-fit ${openIndex === index ? 'bg-white shadow-xl ring-1 ring-gray-100' : 'bg-[#F9FAFB] hover:bg-white hover:shadow-md'}`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                  >
                    <h3 className={`text-lg md:text-xl font-bold transition-colors ${openIndex === index ? 'text-brand-orange' : 'text-gray-900'}`}>
                      {faq.question}
                    </h3>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-brand-orange text-white rotate-180' : 'bg-white text-gray-400 group-hover:bg-gray-100'}`}>
                      {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-8 pb-8 text-gray-500 leading-relaxed text-lg border-t border-gray-100/50 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 3. Contact CTA */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#0e4b5b] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Still have questions?</h2>
              <p className="text-teal-100 text-lg mb-10 leading-relaxed">
                Can't find the answer you're looking for? Our friendly team is here to chat and help you with any questions you have.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0e4b5b] rounded-full font-bold text-sm uppercase tracking-wider hover:bg-brand-orange hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </Link>
                <a href="mailto:support@printerpro.com" className="inline-flex items-center gap-3 px-8 py-4 bg-[#093642] text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#072a33] transition-all duration-300 border border-white/10">
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}