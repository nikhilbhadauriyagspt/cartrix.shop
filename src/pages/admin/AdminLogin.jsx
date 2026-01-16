import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Lock, Mail, ShieldCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, admin } = useAdminAuth()

  useEffect(() => {
    document.title = 'Admin Access - Modern Workspace'
    if (admin) {
      navigate('/admin/dashboard')
    }
  }, [admin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/admin/dashboard')
    } else {
      setError(result.error || 'Invalid email or password')
    }

    setLoading(false)
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
              <ShieldCheck className="w-3 h-3" />
              Secure Hub Access
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
              Admin <br />
              <span className="text-gray-400">Portal.</span>
            </h2>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 animate-shake shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                <AlertCircle className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Administrator Email</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Security Password</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-2xl shadow-gray-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-50 mt-10"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Hub</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-gray-50 text-center">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] leading-relaxed">
              Proprietary System Access <br />
              Authorized Personnel Only
            </p>
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
