import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWebsite } from '../contexts/WebsiteContext'
import { supabase } from '../lib/supabase'

export default function Policy() {
  const { slug } = useParams()
  const { websiteId } = useWebsite()
  const navigate = useNavigate()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (websiteId) {
      fetchPolicy()
    }
  }, [slug, websiteId])

  useEffect(() => {
    if (policy) {
      document.title = `${policy.title} - Store Policy`

      const setMetaTag = (name, content) => {
        let element = document.querySelector(`meta[name="${name}"]`)
        if (!element) {
          element = document.createElement('meta')
          element.setAttribute('name', name)
          document.head.appendChild(element)
        }
        element.setAttribute('content', content)
      }

      setMetaTag('description', policy.title)
      setMetaTag('keywords', `${policy.title}, store policy, terms, printer store policy`)
    }
  }, [policy])

  const fetchPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('website_id', websiteId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        navigate('/')
        return
      }

      setPolicy(data)
    } catch (error) {
      console.error('Error fetching policy:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2-b-2 border-2-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!policy) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl border-2-2 border-2-gray-100 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {policy.title}
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            Last updated: {new Date(policy.updated_at).toLocaleDateString()}
          </div>
          <div
            className="prose prose-slate prose-lg max-w-none
                       prose-headings:font-bold prose-headings:text-gray-900
                       prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                       prose-p:text-gray-700 prose-p:leading-relaxed
                       prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-gray-900 prose-strong:font-semibold
                       prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                       prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                       prose-li:text-gray-700
                       prose-blockquote:border-l-4 prose-blockquote:border-2-primary-500 prose-blockquote:pl-4 prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>
      </div>
    </div>
  )
}
