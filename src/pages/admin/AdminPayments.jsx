import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CreditCard, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Settings</h1>
        <p className="text-gray-600">Configure payment gateways and manage payment methods</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-1">Razorpay Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create account at razorpay.com</li>
              <li>Go to Settings - API Keys</li>
              <li>Copy Key ID (API Key) and Key Secret (API Secret)</li>
              <li>Paste them below and enable Razorpay</li>
              <li>Enable payment methods you want to offer</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Stripe Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create account at stripe.com</li>
              <li>Go to Developers - API Keys</li>
              <li>Copy Publishable Key (API Key) and Secret Key (API Secret)</li>
              <li>Paste them below and enable Stripe</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Cash on Delivery:</h4>
            <p className="ml-2">Already enabled by default. No setup required.</p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Payment Gateways
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Add your payment gateway API credentials. Keep these secure and never share them.
        </p>

        <div className="space-y-6">
          {paymentSettings.map((setting) => (
            <div key={setting.id} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{setting.gateway_name}</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={setting.is_test_mode}
                      onChange={(e) => handleSettingUpdate(setting.id, 'is_test_mode', e.target.checked)}
                      className="rounded"
                    />
                    Test Mode
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={setting.is_enabled}
                      onChange={(e) => handleSettingUpdate(setting.id, 'is_enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className={setting.is_enabled ? 'text-green-600 font-bold' : 'text-gray-600'}>
                      {setting.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets[`${setting.id}-key`] ? 'text' : 'password'}
                      value={setting.api_key || ''}
                      onChange={(e) => handleSettingUpdate(setting.id, 'api_key', e.target.value)}
                      placeholder="Enter API Key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-2xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility(`${setting.id}-key`)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showSecrets[`${setting.id}-key`] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    API Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets[`${setting.id}-secret`] ? 'text' : 'password'}
                      value={setting.api_secret || ''}
                      onChange={(e) => handleSettingUpdate(setting.id, 'api_secret', e.target.value)}
                      placeholder="Enter API Secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-2xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility(`${setting.id}-secret`)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showSecrets[`${setting.id}-secret`] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enable or disable payment methods available to customers during checkout.
        </p>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
              <div>
                <h4 className="font-bold">{method.method_name}</h4>
                <p className="text-sm text-gray-500">
                  {method.method_type === 'cod' ? 'Cash on Delivery' : 'Payment Gateway'}
                </p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={method.is_enabled}
                  onChange={(e) => handleMethodUpdate(method.id, 'is_enabled', e.target.checked)}
                  className="rounded"
                />
                <span className={`text-sm font-bold ${method.is_enabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {method.is_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveAllSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
