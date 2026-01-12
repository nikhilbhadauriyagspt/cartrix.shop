import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Phone, MapPin, Send, Clock, Check } from 'lucide-react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useWebsite } from '../contexts/WebsiteContext'

export default function Contact() {
  const { settings } = useSiteSettings()
  const { websiteId } = useWebsite()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Contact Us - Get In Touch'
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert([{ ...formData, website_id: websiteId }])

      if (submitError) throw submitError

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSuccess(false), 6000)
    } catch (err) {
      setError('Unable to send message. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50  text-gray-900 ">
      {/* Hero Section - Minimalist & Engaging */}
      <section className="relative py-20 md:py-24 bg-gradient-to-br from-primary-50 to-primary-100  overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 ">
          <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <path d="M0 0h100v100H0z" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0L0 0 0 10" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
              </pattern>
            </defs>
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900  mb-4">
            Let's Connect
          </h1>
          <p className="text-lg md:text-xl text-gray-700  max-w-2xl mx-auto">
            We're here to help with any questions, feedback, or support you need.
          </p>
        </div>
      </section>

      {/* Main Content - Form & Details */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        {/* Alternative Contact Details */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {settings.contact_email && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100  text-center">
              <Mail className="w-10 h-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900  mb-2">Email Us</h3>
              <a
                href={`mailto:${settings.contact_email}`}
                className="text-primary-600 hover:text-primary-700 font-medium break-words"
              >
                {settings.contact_email}
              </a>
            </div>
          )}

          {settings.contact_phone && (
            <div className="bg-white  rounded-xl shadow-md p-6 border border-gray-100  text-center">
              <Phone className="w-10 h-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900  mb-2">Call Us</h3>
              <a
                href={`tel:${settings.contact_phone}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {settings.contact_phone}
              </a>
            </div>
          )}

          {settings.address && (
            <div className="bg-white  rounded-xl shadow-md p-6 border border-gray-100  text-center lg:col-span-1 sm:col-span-2">
              <MapPin className="w-10 h-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900  mb-2">Visit Us</h3>
              <p className="text-gray-700  leading-relaxed">
                {settings.address}
              </p>
            </div>
          )}
        </div>
        {/* Contact Form */}
        <div className="bg-white  rounded-xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100 ">
          <h2 className="text-3xl font-bold text-gray-900  text-center mb-8">Send Us a Message</h2>

          {success && (
            <div className="mb-6 p-4 bg-green-50  border border-green-200  rounded-lg flex items-center gap-3 text-green-700 ">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Message sent successfully! We'll reply within 24-48 hours.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50  border border-red-200  rounded-lg text-red-700  text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700  mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-gray-50  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700  mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-gray-50  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700  mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (123) 456-7890"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-gray-50  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700  mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Regarding your order / General inquiry"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-gray-50  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700  mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we assist you today?"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-gray-50  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? 'Sending...' : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>




      </div>
    </div>
  )
}