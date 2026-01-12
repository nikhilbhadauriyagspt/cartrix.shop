import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import {
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AdminSettings() {
  const { admin, updateAdminEmail, updateAdminPassword } = useAdminAuth()
  const [newEmail, setNewEmail] = useState(admin?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    setEmailMessage({ type: '', text: '' })
    setEmailLoading(true)

    if (newEmail === admin?.email) {
      setEmailMessage({ type: 'error', text: 'New email is the same as current email' })
      setEmailLoading(false)
      return
    }

    if (!newEmail.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Please enter a valid email address' })
      setEmailLoading(false)
      return
    }

    const result = await updateAdminEmail(newEmail)

    if (result.success) {
      setEmailMessage({ type: 'success', text: 'Email updated successfully!' })
    } else {
      setEmailMessage({ type: 'error', text: result.error || 'Failed to update email' })
    }

    setEmailLoading(false)
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })
    setPasswordLoading(true)

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password' })
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      setPasswordLoading(false)
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(newPassword)) {
      setPasswordMessage({
        type: 'error',
        text: 'Password must contain uppercase, lowercase, number, and special character'
      })
      setPasswordLoading(false)
      return
    }

    const result = await updateAdminPassword(newPassword)

    if (result.success) {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordMessage({ type: 'error', text: result.error || 'Failed to update password' })
    }

    setPasswordLoading(false)
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Admin Settings</h2>
          <p className="text-slate-600 mt-1">Manage your admin account credentials</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Email Address</h3>
                <p className="text-sm text-slate-600">Update your admin email</p>
              </div>
            </div>

            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Current Email
                </label>
                <input
                  type="email"
                  value={admin?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="admin@example.com"
                />
              </div>

              {emailMessage.text && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 ${
                  emailMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {emailMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm font-bold ${
                    emailMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {emailMessage.text}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-2xl hover:bg-sky-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Email</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Password</h3>
                <p className="text-sm text-slate-600">Change your admin password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordMessage.text && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm font-bold ${
                    passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {passwordMessage.text}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Security Notice</h4>
              <p className="text-sm text-amber-800">
                Changing your email or password will not log you out of the current session.
                However, you will need to use the new credentials for future logins.
                Make sure to remember your new credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
