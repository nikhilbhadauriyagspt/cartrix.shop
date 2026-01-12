import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Award, DollarSign, CheckCircle, Truck, Target, Printer,
  Building, Home, Users, Zap, Wrench, Package, Shield,
  Settings, Globe, FileText, Clock, Recycle, TrendingUp,
  Lock, Activity, AlertCircle
} from 'lucide-react'

const iconMap = {
  'award': Award,
  'dollar-sign': DollarSign,
  'check-circle': CheckCircle,
  'truck': Truck,
  'target': Target,
  'printer': Printer,
  'building': Building,
  'home': Home,
  'users': Users,
  'zap': Zap,
  'wrench': Wrench,
  'package': Package,
  'shield': Shield,
  'settings': Settings,
  'globe': Globe,
  'file-text': FileText,
  'clock': Clock,
  'recycle': Recycle,
  'chart': TrendingUp,
  'lock': Lock,
  'activity': Activity,
  'circle-alert': AlertCircle,
}

const colorSchemes = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-200', icon: 'text-lime-600' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
}

export default function Guides() {
  const navigate = useNavigate()
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalWordCount, setTotalWordCount] = useState(0)

  useEffect(() => {
    document.title = 'Printer Guides - Expert Tips & Tutorials'

    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('description', 'Explore comprehensive guides and tutorials about printers. Learn tips, tricks, and best practices for printer usage and maintenance.')
    setMetaTag('keywords', 'printer guides, printer tutorials, printer tips, printer maintenance, how to use printers, printer help, printer advice')

    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('is_published', true)
        .order('guide_number', { ascending: true })

      if (error) throw error

      setGuides(data || [])

      const wordCount = (data || []).reduce((acc, guide) => {
        const words = guide.content ? guide.content.split(/\s+/).length : 0
        return acc + words
      }, 0)
      setTotalWordCount(wordCount)
    } catch (error) {
      console.error('Error fetching guides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuideClick = (slug) => {
    navigate(`/guides/${slug}`)
  }

  const handleShopClick = () => {
    navigate('/shop')
  }

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName] || FileText
    return Icon
  }

  const getColorScheme = (scheme) => {
    return colorSchemes[scheme] || colorSchemes.blue
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-slate-100 text-slate-800 mb-4">
              {guides.length} COMPREHENSIVE GUIDES
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">HP LaserJet Pro Guide Library</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to know about selecting, using, and maintaining HP LaserJet printers. Professional guides with practical advice and cost-saving tips.
            </p>
          </div>
        </div>
      </div>

      <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm text-center border-slate-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Professional Advice</h3>
                <p className="text-sm text-slate-600">{totalWordCount.toLocaleString()}+ words of comprehensive guidance</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm text-center border-slate-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Save Money</h3>
                <p className="text-sm text-slate-600">Learn cost-saving tips and TCO optimization</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm text-center border-slate-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Make Smart Choices</h3>
                <p className="text-sm text-slate-600">Compare models and features confidently</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm text-center border-slate-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Ready to Buy</h3>
                <p className="text-sm text-slate-600">Shop with confidence after reading</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Guide Library</h2>
            <p className="text-slate-600">Browse our comprehensive collection of HP LaserJet guides</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const Icon = getIcon(guide.icon_name)
              const colors = getColorScheme(guide.color_scheme)

              return (
                <div
                  key={guide.id}
                  onClick={() => handleGuideClick(guide.slug)}
                  className={`rounded-2xl text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${colors.bg} ${colors.border} cursor-pointer group`}
                >
                  <div className="flex flex-col space-y-1.5 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 bg-white text-slate-700 text-xs">
                        {guide.guide_type}
                      </div>
                    </div>
                    <div className="font-bold tracking-tight text-lg leading-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                      {guide.title}
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <p className="text-sm text-slate-600 mb-4">{guide.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {guide.read_time} min read
                      </span>
                      {guide.guide_number && (
                        <span className="text-xs font-bold text-slate-700">
                          Guide #{guide.guide_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {guides.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No guides available yet. Check back soon!</p>
            </div>
          )}

          <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Choose Your Perfect HP LaserJet?</h2>
              <p className="text-slate-200 mb-8 text-lg">
                Now that you're equipped with professional knowledge, browse our selection of HP LaserJet printers with confidence. Free shipping on orders over $299!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleShopClick}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 bg-white text-slate-900 hover:bg-slate-100"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Shop HP LaserJet Printers
                </button>
                <button
                  onClick={handleShopClick}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-11 rounded-md px-8 text-white border-white hover:bg-white hover:text-slate-900"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Browse All Printers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
