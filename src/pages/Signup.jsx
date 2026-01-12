import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWebsite } from '../contexts/WebsiteContext'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { websiteId } = useWebsite()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Sign Up - Create Your Account'

    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('description', 'Create your account to start shopping for premium printers and enjoy exclusive offers and benefits.')
    setMetaTag('keywords', 'sign up, create account, register, new account, join, membership, customer registration')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, { full_name: name }, websiteId)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100  p-4 relative overflow-hidden">
      {/* Background Visuals (Consistent with Login) */}
      <div className="absolute inset-0 z-0 opacity-20 ">
        <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <path d="M0 0h100v100H0z" fill="url(#pattern-signup)" />
          <defs>
            <pattern id="pattern-signup" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="2" height="2" fill="currentColor" stroke="none" strokeWidth="0" opacity="0.1" />
            </pattern>
          </defs>
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-4xl w-full bg-white  rounded-2xl shadow-2xl backdrop-blur-md bg-opacity-90  p-8 md:p-10 border border-gray-200 ">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900  mb-2">Create Your Account</h2>
          <p className="text-gray-600  text-lg">Join us today and explore premium products</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50  border border-red-200  rounded-lg text-red-700  text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-5">
            <div className='w-full'>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800  mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-white  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                placeholder="John Doe"
              />
            </div>

            <div className='w-full'>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800  mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-white  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800  mb-2">
              Password *
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-white  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800  mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300  bg-white  text-gray-900  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-primary-600 text-white text-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-700  text-base">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700  ">
            Sign In
          </Link>
        </p>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}
