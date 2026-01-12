import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronLeft, Clock, Printer, ShoppingCart, ArrowLeft, CheckCircle, Star, ExternalLink } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function GuideDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchGuide()
  }, [slug])

  useEffect(() => {
    if (guide) {
      document.title = `${guide.title} - Printer Guide`

      const setMetaTag = (name, content) => {
        let element = document.querySelector(`meta[name="${name}"]`)
        if (!element) {
          element = document.createElement('meta')
          element.setAttribute('name', name)
          document.head.appendChild(element)
        }
        element.setAttribute('content', content)
      }

      setMetaTag('description', guide.excerpt || guide.title)
      setMetaTag('keywords', `printer guide, ${guide.title}, printer tips, printer tutorial, printer help`)
    }
  }, [guide])

  const fetchGuide = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*, products(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        navigate('/guides')
        return
      }

      setGuide(data)
      if (data.products) {
        setProduct(data.products)
      }
    } catch (error) {
      console.error('Error fetching guide:', error)
      navigate('/guides')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToGuides = () => {
    navigate('/guides')
  }

  const handleShopClick = () => {
    navigate('/shop')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-2-primary-600"></div>
      </div>
    )
  }

  if (!guide) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <button
        onClick={handleBackToGuides}
        className="fixed left-6 top-24 z-50 bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
        aria-label="Back to Guides"
      >
        <div className="flex items-center">
          <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
          <span className="ml-2 hidden group-hover:inline-block animate-in slide-in-from-left duration-300 font-medium">
            Back to Guides
          </span>
        </div>
      </button>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm">
            <button onClick={handleBackToGuides} className="text-slate-600 hover:text-slate-900">
              Guides
            </button>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-900">Guide #{guide.guide_number || '?'}</span>
          </nav>
        </div>
      </div>

      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-blue-100 text-blue-800">
                {guide.guide_type}
              </div>
              <span className="text-sm text-slate-600 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {guide.read_time} min read
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{guide.title}</h1>
            <p className="text-lg text-slate-600">{guide.description}</p>
          </div>

          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm mb-8">
            <div className="prose prose-slate max-w-none p-8">
              <div dangerouslySetInnerHTML={{ __html: guide.content }} />
            </div>
          </div>

          {guide.faqs && guide.faqs.length > 0 && (
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm mb-8">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {guide.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-slate-200 last:border-0 pb-6 last:pb-0">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-start">
                        <span className="text-blue-600 mr-2">Q:</span>
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 pl-6">
                        <span className="text-green-600 font-bold mr-2">A:</span>
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {guide.key_takeaways && guide.key_takeaways.length > 0 && (
            <div className="rounded-2xl border text-card-foreground shadow-sm mb-8 bg-green-50 border-green-200">
              <div className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                  {guide.key_takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {product && (
            <div className="rounded-2xl border shadow-lg mb-8 bg-gradient-to-br from-sky-50 to-accent-50 border-sky-200">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Printer className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Featured Product</h2>
                </div>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-8">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{product.name}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">{product.description}</p>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="w-4 h-4 text-slate-300" />
                          </div>
                          <span className="text-sm text-slate-600">(4.0)</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-6">
                          <span className="text-3xl font-bold text-slate-900">
                            ${parseFloat(product.discount_price || product.price).toFixed(2)}
                          </span>
                          {product.discount_price && (
                            <span className="text-lg text-slate-500 line-through">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/shop/${product.slug}`}
                          className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white py-3 rounded-2xl font-bold transition-all"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex-1 inline-flex items-center justify-center border-2 border-2-primary-600 text-primary-700 hover:bg-primary-50 py-3 rounded-2xl font-bold transition-all"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border text-card-foreground shadow-sm mb-8 bg-blue-50 border-blue-200">
            <div className="p-6">
              <p className="text-sm text-slate-700 italic">
                <strong>Disclosure:</strong> This site may earn a commission from affiliate links, at no extra cost to you.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm bg-gradient-to-r from-slate-900 to-slate-700">
            <div className="p-8 text-center">
              <Printer className="h-12 w-12 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Buy Your HP LaserJet?</h2>
              <p className="text-slate-200 mb-6 max-w-2xl mx-auto">
                Now that you're informed, explore our selection of HP LaserJet printers with competitive prices and free shipping on orders over $299.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleShopClick}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 bg-white text-slate-900 hover:bg-slate-100"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop HP Printers
                </button>
                <button
                  onClick={handleBackToGuides}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-11 rounded-md px-8 text-white border-white hover:bg-white hover:text-slate-900"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  More Guides
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
