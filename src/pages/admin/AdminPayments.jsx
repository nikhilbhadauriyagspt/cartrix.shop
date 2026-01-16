import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import { 
  CreditCard, 
  Save, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Info,
  Sparkles
} from 'lucide-react'

export default function AdminPayments() {
  const [paymentSettings, setPaymentSettings] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSecrets, setShowSecrets] = useState({})

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)

      const [settingsRes, methodsRes] = await Promise.all([
        supabase.from('payment_settings').select('*').order('gateway_name'),
        supabase.from('payment_methods').select('*').order('display_order')
      ])

      if (settingsRes.error) throw settingsRes.error
      if (methodsRes.error) throw methodsRes.error

      setPaymentSettings(settingsRes.data || [])
      setPaymentMethods(methodsRes.data || [])
    } catch (error) {
      console.error('Error fetching payment data:', error)
      setMessage({ type: 'error', text: 'Failed to load payment settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingUpdate = async (id, field, value) => {
    setPaymentSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    )
  }

  const handleMethodUpdate = async (id, field, value) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, [field]: value } : method
      )
    )
  }

  const saveAllSettings = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })

      for (const setting of paymentSettings) {
        const { error } = await supabase
          .from('payment_settings')
          .update({
            api_key: setting.api_key,
            api_secret: setting.api_secret,
            is_enabled: setting.is_enabled,
            is_test_mode: setting.is_test_mode,
            updated_at: new Date().toISOString()
          })
          .eq('id', setting.id)

        if (error) throw error
      }

      for (const method of paymentMethods) {
        const { error } = await supabase
          .from('payment_methods')
          .update({
            is_enabled: method.is_enabled
          })
          .eq('id', method.id)

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Payment settings saved successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const toggleSecretVisibility = (id) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-brand-orange"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <CreditCard className="w-3 h-3" />
              Financial Configuration
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Payment <span className="text-gray-400">Settings.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Configure gateways and checkout methods for your store.</p>
          </div>
          
          <button
            onClick={saveAllSettings}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Processing...' : 'Save Configuration'}
          </button>
        </div>

        {/* Feedback Messages */}
        {message.text && (
          <div className={`mb-8 p-5 rounded-[2rem] border flex items-center gap-4 animate-slide-up shadow-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
            <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm ${
              message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Settings Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Payment Gateways */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Gateways</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">API Credentials & Authentication</p>
                </div>
              </div>

              <div className="space-y-8">
                {paymentSettings.map((setting) => (
                  <div key={setting.id} className="group p-8 rounded-[2.5rem] bg-[#F9FAFB] border border-gray-100 hover:bg-white hover:border-brand-orange/20 transition-all duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-brand-orange transition-colors shadow-sm">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{setting.gateway_name}</h4>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.is_test_mode}
                            onChange={(e) => handleSettingUpdate(setting.id, 'is_test_mode', e.target.checked)}
                            className="w-5 h-5 border-2 border-gray-200 rounded-lg text-brand-orange focus:ring-brand-orange/20 accent-brand-orange"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sandbox</span>
                        </label>
                        <div className="h-4 w-px bg-gray-200 mx-2" />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.is_enabled}
                            onChange={(e) => handleSettingUpdate(setting.id, 'is_enabled', e.target.checked)}
                            className="w-5 h-5 border-2 border-gray-200 rounded-lg text-brand-orange focus:ring-brand-orange/20 accent-brand-orange"
                          />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${setting.is_enabled ? 'text-emerald-500' : 'text-gray-400'}`}>
                            {setting.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Key Identifier</label>
                        <div className="relative group/input">
                          <input
                            type={showSecrets[`${setting.id}-key`] ? 'text' : 'password'}
                            value={setting.api_key || ''}
                            onChange={(e) => handleSettingUpdate(setting.id, 'api_key', e.target.value)}
                            placeholder="pk_test_..."
                            className="w-full pl-6 pr-12 py-4 rounded-2xl bg-white border border-gray-100 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(`${setting.id}-key`)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-orange transition-colors"
                          >
                            {showSecrets[`${setting.id}-key`] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Secret Token</label>
                        <div className="relative group/input">
                          <input
                            type={showSecrets[`${setting.id}-secret`] ? 'text' : 'password'}
                            value={setting.api_secret || ''}
                            onChange={(e) => handleSettingUpdate(setting.id, 'api_secret', e.target.value)}
                            placeholder="sk_test_..."
                            className="w-full pl-6 pr-12 py-4 rounded-2xl bg-white border border-gray-100 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(`${setting.id}-secret`)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-orange transition-colors"
                          >
                            {showSecrets[`${setting.id}-secret`] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Checkout Methods</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">User-Facing Payment Options</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                    method.is_enabled ? 'border-brand-orange/10 bg-brand-orange/[0.02]' : 'border-gray-50 bg-gray-50/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        method.is_enabled ? 'bg-white text-brand-orange shadow-sm' : 'bg-white/50 text-gray-300'
                      }`}>
                        {method.method_type === 'cod' ? <Sparkles className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${method.is_enabled ? 'text-gray-900' : 'text-gray-400'}`}>{method.method_name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{method.method_type === 'cod' ? 'Manual Handle' : 'Auto Process'}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.is_enabled}
                        onChange={(e) => handleMethodUpdate(method.id, 'is_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Instructions */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden sticky top-32">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Info className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-lg font-black uppercase tracking-widest">Setup Guide</h3>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Razorpay</p>
                    <ul className="space-y-3 text-[11px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                      <li className="flex gap-3">
                        <span className="text-white font-black">01.</span> Generate Key ID and Secret in Razorpay Dashboard Settings.
                      </li>
                      <li className="flex gap-3">
                        <span className="text-white font-black">02.</span> Use Sandbox mode first to test transactions without real money.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/10">
                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Security Note</p>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider italic">
                      "Never commit these keys to version control. They are stored encrypted in your database environment."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
      `}</style>
    </AdminLayout>
  )
}
