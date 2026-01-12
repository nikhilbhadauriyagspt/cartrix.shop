import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function Footer() {
  const { settings } = useSiteSettings()

  const currentYear = new Date().getFullYear()

  const footerNavLinks = [
    { to: '/about', label: 'About Us' },
    { to: '/shop', label: 'Shop' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ]

  const policyLinks = [
    { to: '/policy/privacy-policy', label: 'Privacy Policy' },
    { to: '/policy/terms-conditions', label: 'Terms & Conditions' },
    { to: '/policy/refund-policy', label: 'Refund Policy' },
    { to: '/policy/shipping-cancellation', label: 'Shipping & Cancellation' },

  ]

  return (
    <footer className="bg-white  text-gray-700  py-10 md:py-12 border-t border-gray-200 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-8">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-5">
              {settings.brand_logo ? (
                <img src={settings.brand_logo} alt={settings.brand_name || 'Brand Logo'} className="h-16 w-auto" />
              ) : (
                <span className="text-2xl font-bold text-gray-900 ">
                  {settings.brand_name || 'PriTory'}
                </span>
              )}
            </Link>
            <p className="text-sm text-gray-600  leading-relaxed mb-6">
              Discover innovative, reliable products designed to simplify everyday life and business needs. We deliver quality, great service, and a seamless shopping experience you can trust.   </p>
            <h3 className="text-md font-semibold text-gray-800  mb-3">Join Our Newsletter</h3>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 rounded-l-md bg-gray-100  text-gray-800  text-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-md font-semibold text-gray-800  mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerNavLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-600  hover:text-primary-600  transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/categories"
                  className="text-gray-600  hover:text-primary-600  transition-colors duration-200 text-sm"
                >
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-md font-semibold text-gray-800  mb-4">Legal</h3>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-600  hover:text-primary-600  transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Social */}
          <div>
            <h3 className="text-md font-semibold text-gray-800  mb-4">Contact</h3>
            <ul className="space-y-3 mb-6">
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500  flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600  leading-relaxed">{settings.address}</p>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500  flex-shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm text-gray-600  hover:text-primary-600  transition-colors duration-200"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500  flex-shrink-0" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="text-sm text-gray-600  hover:text-primary-600  transition-colors duration-200"
                  >
                    {settings.contact_phone}
                  </a>
                </li>
              )}
            </ul>

          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200  pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} {settings.brand_name || 'PriTory'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}