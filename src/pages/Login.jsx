import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const { websiteId } = useWebsite()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Login - Modern Workspace'
    window.scrollTo(0, 0)
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle(websiteId)
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6 relative overflow-hidden font-sans selection:bg-brand-orange selection:text-white">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-orange/[0.03] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-orange/[0.03] rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[500px] animate-slide-up">
        <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Portal Access
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
              Welcome <br />
              <span className="text-gray-400">Back.</span>
            </h2>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-shake shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                <Lock className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-brand-orange hover:text-black uppercase tracking-widest transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-2">
              <input
                id="remember_me"
                type="checkbox"
                className="w-6 h-6 border-2 border-gray-100 rounded-lg text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-brand-orange"
              />
              <label htmlFor="remember_me" className="text-xs font-bold text-gray-400 cursor-pointer uppercase tracking-widest">
                Keep me authenticated
              </label>
            </div>

            <div className="space-y-4 mt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-2xl shadow-gray-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-6 bg-white text-gray-900 font-black rounded-2xl border-2 border-gray-100 hover:border-black transition-all duration-500 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>

          <div className="mt-12 pt-10 border-t border-gray-50 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-orange hover:text-black transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gray-200 uppercase tracking-[0.3em]">
            <ShieldCheck className="w-4 h-4" /> SSL Encrypted
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}