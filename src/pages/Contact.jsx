import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Phone, MapPin, Send, Check, Clock, MessageSquare, Sparkles, ArrowRight, User, PhoneCall, FileText } from 'lucide-react'
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
    document.title = 'Get in Touch - Modern Workspace'
    window.scrollTo(0, 0)
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
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-brand-orange selection:text-white">
      
      {/* 1. Soft Minimal Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in shadow-sm">
              <Sparkles className="w-3 h-3" />
              Contact Us
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 tracking-tight leading-[0.9] animate-slide-up">
              Let's Start a <br />
              <span className="text-gray-400">Conversation.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-12 animate-slide-up delay-100 max-w-2xl">
              Have a question or a project in mind? We'd love to hear from you. 
              Our team usually responds within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Contact Split Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Column: Info */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  Reach out to us <br />through any channel.
                </h2>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  Whether you prefer a quick email, a phone call, or visiting our office, 
                  we're here to provide the support you need.
                </p>
              </div>

              <div className="space-y-8">
                {settings.contact_email && (
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 shadow-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Us</div>
                      <a href={`mailto:${settings.contact_email}`} className="text-xl font-bold text-gray-900 hover:text-brand-orange transition-colors">
                        {settings.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contact_phone && (
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call Us</div>
                      <a href={`tel:${settings.contact_phone}`} className="text-xl font-bold text-gray-900 hover:text-blue-500 transition-colors">
                        {settings.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings.address && (
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visit Us</div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Working Hours Card */}
              <div className="p-10 rounded-[3rem] bg-[#F9FAFB] border border-gray-100 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Working Hours</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
                    <span className="text-gray-500 font-medium">Monday — Friday</span>
                    <span className="font-bold text-gray-900">9am — 6pm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Weekend</span>
                    <span className="font-bold text-brand-orange italic">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[3.5rem] p-8 md:p-12 lg:p-16 shadow-2xl border border-gray-50 relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
                
                <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Send a message.</h2>
                
                {success && (
                  <div className="mb-10 p-6 bg-green-50 border border-green-100 rounded-[2rem] flex items-center gap-4 text-green-800 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-none mb-1">Message Sent!</p>
                      <p className="text-sm opacity-90">Thank you. We'll get back to you shortly.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-14 pr-8 py-5 rounded-[1.5rem] bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium outline-none"
                          placeholder="Full Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-14 pr-8 py-5 rounded-[1.5rem] bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium outline-none"
                          placeholder="hello@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-14 pr-8 py-5 rounded-[1.5rem] bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium outline-none"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                      <div className="relative">
                        <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full pl-14 pr-8 py-5 rounded-[1.5rem] bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium outline-none"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                    <textarea
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-8 py-6 rounded-[1.5rem] bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium outline-none resize-none"
                      placeholder="Tell us about your project or inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-black text-white font-bold rounded-[1.5rem] hover:bg-brand-orange transition-all duration-300 shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">Sending message...</span>
                    ) : (
                      <>
                        <span className="text-sm uppercase tracking-widest">Send Message</span>
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
      `}</style>
    </div>
  )
}