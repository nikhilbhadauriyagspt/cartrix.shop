import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowUp, Send, Printer } from 'lucide-react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function Footer() {
  const { settings } = useSiteSettings()
  const currentYear = new Date().getFullYear()

  const shopLinks = [
    { to: '/shop', label: 'All Products' },
    { to: '/shop/category/home-printers', label: 'Home Printers' },
    { to: '/shop/category/office-printers', label: 'Office Printers' },
    { to: '/shop/category/inkjet-printers', label: 'Inkjet Printers' },
    { to: '/shop/category/laser-printers', label: 'Laser Printers' },
  ]

  const companyLinks = [
    { to: '/about', label: 'Our Story' },
    { to: '/faq', label: 'Help Center' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/categories', label: 'Departments' },
  ]

  const legalLinks = [
    { to: '/policy/privacy-policy', label: 'Privacy Policy' },
    { to: '/policy/terms-conditions', label: 'Terms & Conditions' },
    { to: '/policy/refund-policy', label: 'Returns & Refund' },
    { to: '/policy/shipping-cancellation', label: 'Shipping Info' },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-black text-white pt-24 pb-12 font-sans overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-20 border-b border-white/10">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block group">
              {settings.brand_logo ? (
                <img src={settings.brand_logo} alt="Logo" className="h-12 w-auto brightness-0 invert" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-xl rounded-sm group-hover:bg-brand-orange transition-colors">P</div>
                  <span className="text-2xl font-black tracking-tighter uppercase">{settings.brand_name || 'PRINTER'}<span className="text-brand-orange">.</span></span>
                </div>
              )}
            </Link>

            <p className="text-gray-400 text-lg leading-relaxed max-w-sm font-medium">
              Empowering businesses with high-performance printing solutions and premium supplies since 2008. Our commitment to excellence ensures that every document you print reflects professional quality and precision.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Shop</h4>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-300 hover:text-brand-orange transition-colors font-medium">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-300 hover:text-brand-orange transition-colors font-medium">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Newsletter</h4>
            <p className="text-gray-400 font-medium">Get exclusive offers and printing tips delivered to your inbox.</p>

            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-orange transition-all font-medium pr-16"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all">
                <Send className="w-5 h-5" />
              </button>
            </form>

            <div className="pt-4 space-y-4">
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-3 text-gray-300 hover:text-brand-orange transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-bold">{settings.contact_phone}</span>
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-3 text-gray-300 hover:text-brand-orange transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-bold">{settings.contact_email}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {legalLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{link.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-8">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              &copy; {currentYear} {settings.brand_name || 'Printer Pro'}. ALL RIGHTS RESERVED.
            </p>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}
