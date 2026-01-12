import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useWebsite } from '../contexts/WebsiteContext'
import { Link } from 'react-router-dom'

export default function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsite()

  useEffect(() => {
    document.title = 'FAQ - Frequently Asked Questions'

    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('description', 'Find answers to frequently asked questions about our printers, delivery, returns, and more. Get quick help with common queries.')
    setMetaTag('keywords', 'FAQ, frequently asked questions, printer help, printer support, printer questions, delivery information, return policy')

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Hero Section */}
      <section className="bg-primary-50  py-16 md:py-20 text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900  mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl text-gray-700  max-w-2xl mx-auto">
            Find quick answers to your questions about our products, orders, shipping, and more.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        {/* Static Introductory Content */}
        <div className="mb-10 text-gray-700  leading-relaxed">
          <p className="text-lg mb-4">
            Welcome to our FAQ section! We've compiled a list of common questions to help you find the information you need quickly. If you can't find an answer here, please don't hesitate to reach out to our customer support team.
          </p>
          <p className="text-md">
            Our goal is to ensure a smooth and enjoyable experience with our products and services, from browsing to after-sales support.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="ml-4 text-gray-600 ">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white  rounded-xl shadow-md p-8 text-center border border-gray-100 ">
            <p className="text-gray-600  text-lg">No FAQs available at the moment. Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50  transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900  pr-4 flex items-start">
                    <span className="flex-shrink-0 mr-3 text-primary-600 font-bold">{index + 1}.</span>
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="flex-shrink-0 text-primary-600" size={24} />
                  ) : (
                    <ChevronDown className="flex-shrink-0 text-gray-500 " size={24} />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 text-gray-700  leading-relaxed border-t border-gray-100  pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Still Have Questions? Section */}
        <div className="mt-16 text-center bg-white  rounded-xl shadow-md p-8 border border-gray-100 ">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900  mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-700  max-w-xl mx-auto mb-6">
            If you couldn't find the answer you were looking for, our friendly support team is here to help!
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-8 py-3 border border-primary-600 text-primary-700  font-semibold rounded-full shadow-md hover:bg-primary-50  transition-all duration-300 transform hover:scale-105"
          >
            Contact Us <ChevronDown className="ml-2 w-5 h-5 rotate-[-90deg]" />
          </Link>
        </div>
      </div>
    </div>
  )
}
