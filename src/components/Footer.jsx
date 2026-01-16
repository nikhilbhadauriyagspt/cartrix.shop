import { Link } from 'react-router-dom'
import {
  Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, CreditCard
} from 'lucide-react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function Footer() {
  const { settings } = useSiteSettings()
  const currentYear = new Date().getFullYear()

  const sections = [
    {
      title: "Solutions",
      links: [
        { to: '/shop', label: 'All Products' },
        { to: '/shop/category/756dd52d-442e-407d-9a5c-7324499bf14b', label: 'Inkjet Printers' },
        { to: '/shop', label: 'Laser Printers' },
        { to: '/shop', label: 'Eco-Friendly Ink' },
        { to: '/shop', label: 'Business Series' },
      ]
    },
    {
      title: "Support",
      links: [
        { to: '/faq', label: 'Help Center' },
        { to: '/contact', label: 'Contact Us' },
        { to: '/about', label: 'Warranty Info' },
        { to: '/shop', label: 'Order Status' },
      ]
    },
    {
      title: "Policies",
      links: [
        { to: '/policy/privacy-policy', label: 'Privacy Policy' },
        { to: '/policy/terms-conditions', label: 'Terms & Conditions' },
        { to: '/policy/shipping-cancellation', label: 'Shipping & Cancellation' },
        { to: '/policy/refund-policy', label: 'Returns & Refunds' },
      ]
    },
    {
      title: "Company",
      links: [
        { to: '/about', label: 'Our Story' },
        { to: '/categories', label: 'Categories' },
        { to: '/contact', label: 'Store Locator' },
      ]
    }
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-100 font-sans pt-24">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Top Section: Brand & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20">

          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block">
              {settings.brand_logo ? (
                <img src={settings.brand_logo} alt="Logo" className="h-24 w-auto" />
              ) : (
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">
                    {settings.brand_name || 'PRINTER'}
                    <span className="text-brand-orange">.</span>
                  </span>
                </div>
              )}
            </Link>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm font-medium">
              Revolutionizing the way you print. We provide high-performance solutions for modern creators and enterprises.
            </p>
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {sections.map((section) => (
                <div key={section.title} className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">
                    {section.title}
                  </h4>
                  <ul className="space-y-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="text-gray-500 hover:text-brand-orange font-medium text-sm transition-colors flex items-center group"
                        >
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 -translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section: Contact Info Cards */}
        {(() => {
          const contactItems = [
            { icon: MapPin, label: "Our Studio", value: settings.address },
            { icon: Phone, label: "Call Support", value: settings.contact_phone },
            { icon: Mail, label: "Email Us", value: settings.contact_email },
          ].filter(item => item.value);

          if (contactItems.length === 0) return null;

          return (
            <div className={`grid grid-cols-1 ${contactItems.length === 1 ? 'md:grid-cols-1' :
              contactItems.length === 2 ? 'md:grid-cols-2' :
                'md:grid-cols-3'
              } gap-6 py-12 border-y border-gray-200`}>
              {contactItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-brand-orange">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Bottom Section */}
        <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3 text-gray-400 font-medium text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Secure & encrypted transactions</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 font-medium text-xs uppercase tracking-widest border-l border-gray-200 pl-0 md:pl-6">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>We accept <span className="text-blue-600 font-bold italic">PayPal</span></span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-right">
              &copy; {currentYear} {settings.brand_name || 'Printer Pro'}. subsidiary of PrimeFix Solutions LLC. Built for Performance.
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}