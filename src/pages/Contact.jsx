import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Phone, MapPin, Send, Check, Clock, MessageSquare } from 'lucide-react'
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
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 bg-[#F2F7F6]">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 text-center relative z-10">
          <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-4 block animate-fade-in">
            Contact Us
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            Let's Start a <span className="text-brand-orange">Conversation</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Have a question about our products or need technical support? We're here to help you every step of the way.
          </p>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      </section>

      {/* 2. Main Content Split */}
      <section className="py-24">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-16">
            
            {/* Left Column: Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-[#0e4b5b] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-3xl font-black mb-8 relative z-10">Get in Touch</h3>
                
                <div className="space-y-8 relative z-10">
                  {settings.contact_email && (
                    <div className="flex items-start gap-5 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange transition-colors duration-300">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-teal-200 text-sm font-bold uppercase tracking-wider mb-1">Email Us</p>
                        <a href={`mailto:${settings.contact_email}`} className="text-xl font-bold hover:text-teal-200 transition-colors">
                          {settings.contact_email}
                        </a>
                        <p className="text-sm text-teal-100/60 mt-1">We usually reply within 24hrs</p>
                      </div>
                    </div>
                  )}

                  {settings.contact_phone && (
                    <div className="flex items-start gap-5 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange transition-colors duration-300">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-teal-200 text-sm font-bold uppercase tracking-wider mb-1">Call Us</p>
                        <a href={`tel:${settings.contact_phone}`} className="text-xl font-bold hover:text-teal-200 transition-colors">
                          {settings.contact_phone}
                        </a>
                        <p className="text-sm text-teal-100/60 mt-1">Mon-Fri, 9am - 6pm EST</p>
                      </div>
                    </div>
                  )}

                  {settings.address && (
                    <div className="flex items-start gap-5 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange transition-colors duration-300">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-teal-200 text-sm font-bold uppercase tracking-wider mb-1">Visit HQ</p>
                        <p className="text-lg font-medium leading-relaxed">
                          {settings.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Support Card */}
              <div className="bg-[#F9FAFB] rounded-[2.5rem] p-10 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Need faster help?</h4>
                </div>
                <p className="text-gray-500 mb-6">Check our extensive Knowledge Base for instant answers to common questions.</p>
                <a href="/faq" className="text-brand-orange font-bold text-sm uppercase tracking-wider border-b-2 border-brand-orange pb-1 hover:text-orange-700 hover:border-orange-700 transition-all">
                  Visit FAQ Center
                </a>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 mb-8">Send a Message</h2>
                
                {success && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-800 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Message Sent!</p>
                      <p className="text-sm opacity-90">Thank you. We'll get back to you shortly.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-800">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 transition-all font-medium outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 transition-all font-medium outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 transition-all font-medium outline-none"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 transition-all font-medium outline-none"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">Message</label>
                    <textarea
                      name="message"
                      required
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-0 transition-all font-medium outline-none resize-y"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-black text-white font-bold rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Office Locations Map Placeholder (Optional visual filler) */}
      <section className="py-12 pb-24">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#F2F7F6] rounded-[3rem] h-96 w-full flex items-center justify-center relative overflow-hidden group">
             {/* Use a static map image or pattern */}
             <img 
               src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
               alt="Map Background" 
               className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
             />
             <div className="relative z-10 bg-white/90 backdrop-blur-md px-10 py-6 rounded-3xl shadow-xl text-center">
               <MapPin className="w-10 h-10 text-brand-orange mx-auto mb-3 animate-bounce" />
               <h3 className="text-xl font-bold text-gray-900">Headquarters</h3>
               <p className="text-gray-500">{settings.address || '123 Printer Street, Tech City'}</p>
             </div>
          </div>
        </div>
      </section>

    </div>
  )
}
