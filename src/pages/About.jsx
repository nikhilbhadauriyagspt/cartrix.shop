import { useEffect } from 'react'
import { CheckCircle, Award, Users, Target, Eye, Gem, TrendingUp, Printer, Shield, Zap, Heart } from 'lucide-react'

import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function About() {
  const { settings } = useSiteSettings()

  useEffect(() => {
    document.title = `About Us - ${settings.brand_name || 'Premium Printers'}`

    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('description', 'Discover our journey in delivering top-quality printers and printing solutions. Trusted by businesses and homes worldwide for reliability and innovation.')
    setMetaTag('keywords', 'about us, printer company, printing solutions, quality printers, e-commerce printers')
  }, [settings])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
      {/* Hero Section - Bold & Modern */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="assets/about/aboutus.png"
            alt="About Us Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-md animate-fade-in-down">
            Our Journey, Our Passion
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 drop-shadow animate-fade-in delay-200">
            Your comprehensive partner for Printers, Accessories, and Ink.
          </p>
        </div>
      </section>

      {/* Story & Vision - Integrated Narrative */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission & Story Text */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Who We Are
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Founded on the principle of transforming printing experiences, {settings.brand_name} began with a simple yet powerful idea: to connect individuals and businesses with the most reliable, efficient, and innovative printing technology available. We've grown from a vision into a trusted name, known for our commitment to quality and customer success across a wide range of products including **printers, essential accessories, and a diverse selection of ink and toner cartridges.**
                </p>
              </div>

            </div>

            {/* Visual Element */}
            <div className="lg:pl-16">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="assets/about/aboutus.png" alt="Modern Printing Facility"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white text-2xl font-bold">
                  Innovation in Every Detail
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="
          text-3xl sm:text-4xl font-extrabold text-center
          text-gray-900 dark:text-white
          mb-12
        ">
            What We Do: Our Purpose
          </h2>

          <div className="
          grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16
        ">
            {/* Mission Card */}
            <div className="
            flex flex-col items-center text-center
            p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800
            bg-gray-50 dark:bg-gray-950
            transform hover:scale-[1.02] transition-transform duration-300 ease-in-out
          ">
              <div className="
              p-4 rounded-full bg-blue-100 dark:bg-blue-900
              text-blue-600 dark:text-blue-400
              mb-6
              shadow-md
            ">
                <Target size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-md">
                To empower individuals and businesses with cutting-edge printing solutions that foster creativity, enhance productivity, and deliver unparalleled quality. We strive to make advanced technology accessible and intuitive for everyone.
              </p>
            </div>

            {/* Vision Card */}
            <div className="
            flex flex-col items-center text-center
            p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800
            bg-gray-50 dark:bg-gray-950
            transform hover:scale-[1.02] transition-transform duration-300 ease-in-out
          ">
              <div className="
              p-4 rounded-full bg-indigo-100 dark:bg-indigo-900
              text-indigo-600 dark:text-indigo-400
              mb-6
              shadow-md
            ">
                <Eye size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-md">
                To be the leading global provider of innovative printing technology, recognized for our commitment to sustainability, exceptional customer service, and continuous advancement in the digital and physical printing landscape.
              </p>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="mt-16 md:mt-24 text-center">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
              Our Core Values
            </h3>
            <div className="
            grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
          ">
              {/* Value Card 1 */}
              <div className="
              flex flex-col items-center p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800
              bg-gray-50 dark:bg-gray-950
              hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out
            ">
                <div className="
                p-3 rounded-full bg-emerald-100 dark:bg-emerald-900
                text-emerald-600 dark:text-emerald-400
                mb-4
              ">
                  <Gem size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Innovation</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Constantly seeking new ways to improve and deliver cutting-edge solutions.
                </p>
              </div>

              {/* Value Card 2 */}
              <div className="
              flex flex-col items-center p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800
              bg-gray-50 dark:bg-gray-950
              hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out
            ">
                <div className="
                p-3 rounded-full bg-amber-100 dark:bg-amber-900
                text-amber-600 dark:text-amber-400
                mb-4
              ">
                  <Target size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quality</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Committed to excellence in every product and service we offer.
                </p>
              </div>

              {/* Value Card 3 */}
              <div className="
              flex flex-col items-center p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800
              bg-gray-50 dark:bg-gray-950
              hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out
            ">
                <div className="
                p-3 rounded-full bg-purple-100 dark:bg-purple-900
                text-purple-600 dark:text-purple-400
                mb-4
              ">
                  <Eye size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Customer Focus</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Placing our customers at the heart of everything we do.
                </p>
              </div>

              {/* Value Card 4 */}
              <div className="
              flex flex-col items-center p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800
              bg-gray-50 dark:bg-gray-950
              hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out
            ">
                <div className="
                p-3 rounded-full bg-cyan-100 dark:bg-cyan-900
                text-cyan-600 dark:text-cyan-400
                mb-4
              ">
                  <Gem size={28} /> {/* Reusing Gem for example */}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Integrity</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Upholding the highest standards of ethics and transparency.
                </p>
              </div>

              {/* Value Card 5 */}
              <div className="
              flex flex-col items-center p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800
              bg-gray-50 dark:bg-gray-950
              hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out
            ">
                <div className="
                p-3 rounded-full bg-pink-100 dark:bg-pink-900
                text-pink-600 dark:text-pink-400
                mb-4
              ">
                  <Target size={28} /> {/* Reusing Target for example */}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sustainability</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Committed to environmentally responsible practices and products.
                </p>
              </div>

              {/* Value Card 6 */}
              <div className="
              flex flex-col items-center p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800
              bg-gray-50 dark:bg-gray-950
              hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out
            ">
                <div className="
                p-3 rounded-full bg-lime-100 dark:bg-lime-900
                text-lime-600 dark:text-lime-400
                mb-4
              ">
                  <Eye size={28} /> {/* Reusing Eye for example */}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Collaboration</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Working together to achieve shared goals and foster a supportive environment.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* Impact in Numbers - Featured */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-12">
            Our Impact in Numbers
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-4">
              <h3 className="text-5xl md:text-6xl font-extrabold text-primary-600 mb-2">50K+</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">Happy Customers</p>
            </div>
            <div className="p-4">
              <h3 className="text-5xl md:text-6xl font-extrabold text-primary-600 mb-2">15+</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">Years of Experience</p>
            </div>
            <div className="p-4">
              <h3 className="text-5xl md:text-6xl font-extrabold text-primary-600 mb-2">99%</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">Satisfaction Rate</p>
            </div>
            <div className="p-4">
              <h3 className="text-5xl md:text-6xl font-extrabold text-primary-600 mb-2">100+</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">Brands Offered</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}