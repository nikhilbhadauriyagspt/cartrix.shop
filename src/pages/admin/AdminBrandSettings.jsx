import { useState, useEffect, Fragment } from 'react'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Save, AlertCircle, CheckCircle, Bell, PlusCircle, Globe } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

export default function AdminBrandSettings() {
  const { websiteId, refreshWebsites } = useWebsite()
  const { admin } = useAdminAuth()
  const [settings, setSettings] = useState({
    brand_name: '',
    brand_logo: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    announcement_text: '',
    announcement_enabled: false,
  })
  const [allWebsites, setAllWebsites] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false)
  const [newWebsiteName, setNewWebsiteName] = useState('')
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('')
  const [newWebsiteIsActive, setNewWebsiteIsActive] = useState(true)
  const [addWebsiteLoading, setAddWebsiteLoading] = useState(false)
  const [addWebsiteMessage, setAddWebsiteMessage] = useState({ type: '', text: '' })


  useEffect(() => {
    if (admin?.id) { // Only fetch if admin is authenticated
      fetchSettings()
      fetchAllWebsites()
    }
  }, [websiteId, admin?.id]) // Re-fetch when websiteId or admin changes

  const fetchAllWebsites = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_all_websites')
      if (error) throw error
      setAllWebsites(data || [])
    } catch (error) {
      console.error('Error fetching all websites:', error)
      setMessage({ type: 'error', text: 'Failed to load all websites' })
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('website_id', websiteId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setSettings(data)
      } else {
        // If no settings exist for this websiteId, initialize with defaults for brand settings
        setSettings({
          brand_name: '',
          brand_logo: '',
          contact_email: '',
          contact_phone: '',
          address: '',
          announcement_text: '',
          announcement_enabled: false,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    })
  }

  const handleToggleAnnouncement = () => {
    setSettings({ ...settings, announcement_enabled: !settings.announcement_enabled });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      if (!admin?.id) {
        throw new Error('Admin not authenticated')
      }

      const settingsData = {
        brand_name: settings.brand_name,
        brand_logo: settings.brand_logo || '',
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address || '',
        announcement_text: settings.announcement_text || '',
        announcement_enabled: settings.announcement_enabled || false,
        website_id: websiteId // Ensure website_id is passed for upsert
      }

      const { data, error } = await supabase
        .rpc('admin_upsert_site_settings', {
          settings_data: settingsData
        })

      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Failed to save settings')

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddWebsiteSubmit = async (e) => {
    e.preventDefault()
    setAddWebsiteLoading(true)
    setAddWebsiteMessage({ type: '', text: '' })

    try {
      if (!newWebsiteName || !newWebsiteDomain) {
        throw new Error('Name and Domain are required.')
      }

      const { data, error } = await supabase.rpc('admin_manage_website', {
        p_id: null, // Creating a new website, so id is null
        p_name: newWebsiteName,
        p_domain: newWebsiteDomain,
        p_is_active: newWebsiteIsActive,
        p_config: {} // Initial empty config
      })

      if (error) throw error

      setAddWebsiteMessage({ type: 'success', text: `Website "${newWebsiteName}" added successfully!` })
      setNewWebsiteName('')
      setNewWebsiteDomain('')
      setNewWebsiteIsActive(true)
      fetchAllWebsites() // Refresh the list of websites
      refreshWebsites(); // Refresh the WebsiteContext
      setTimeout(() => {
        setIsAddWebsiteModalOpen(false)
        setAddWebsiteMessage({ type: '', text: '' })
      }, 2000); // Close modal and clear message after delay
    } catch (error) {
      console.error('Error adding new website:', error)
      setAddWebsiteMessage({ type: 'error', text: error.message || 'Failed to add website.' })
    } finally {
      setAddWebsiteLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Website Settings</h1>
          <p className="text-gray-600">Manage your brand, contact information and available websites</p>
        </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Websites List and Add New Website */}
      <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Manage Websites</h2>
          <button
            type="button"
            onClick={() => setIsAddWebsiteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={18} /> Add New Website
          </button>
        </div>

        {allWebsites.length === 0 ? (
          <p className="text-gray-500">No websites found. Click "Add New Website" to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allWebsites.map((website) => (
                  <tr key={website.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {website.name} {website.id === websiteId && <span className="text-blue-500 text-xs">(Current)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{website.domain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        website.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {website.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{website.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Brand Settings for <span className="text-blue-600">{allWebsites.find(w => w.id === websiteId)?.name || 'Current Website'}</span></h2>
        <p className="text-gray-500 text-sm">These settings apply to the currently selected website.</p>
        <hr className="my-4" />

        <div>
          <label htmlFor="brand_name" className="block text-sm font-bold text-gray-700 mb-2">
            Brand Name *
          </label>
          <input
            type="text"
            id="brand_name"
            name="brand_name"
            value={settings.brand_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Printer Pro"
          />
          <p className="mt-1 text-sm text-gray-500">
            This name will appear throughout the website (header, footer, pages, etc.)
          </p>
        </div>

        <div>
          <label htmlFor="brand_logo" className="block text-sm font-bold text-gray-700 mb-2">
            Brand Logo URL
          </label>
          <input
            type="url"
            id="brand_logo"
            name="brand_logo"
            value={settings.brand_logo}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/logo.png"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional: URL to your brand logo image
          </p>
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-bold text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={settings.contact_email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="info@example.com"
          />
        </div>

        <div>
          <label htmlFor="contact_phone" className="block text-sm font-bold text-gray-700 mb-2">
            Contact Phone *
          </label>
          <input
            type="tel"
            id="contact_phone"
            name="contact_phone"
            value={settings.contact_phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1-234-567-8900"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={settings.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your business address"
          />
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Announcement Bar</h3>
              <p className="text-sm text-gray-600">Display an announcement at the top of your website</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-gray-900">Enable Announcement Bar</p>
                <p className="text-sm text-gray-600">Show announcement to visitors</p>
              </div>
              <button
                type="button"
                onClick={handleToggleAnnouncement}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.announcement_enabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.announcement_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label htmlFor="announcement_text" className="block text-sm font-bold text-gray-700 mb-2">
                Announcement Text
              </label>
              <textarea
                id="announcement_text"
                name="announcement_text"
                value={settings.announcement_text || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Free Shipping on Orders Over $500 | Sale: Up to 30% Off Select Models | Limited Time Offer"
              />
              <p className="mt-1 text-sm text-gray-500">
                This message will appear in a banner at the top of your website. Leave empty to hide.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Add New Website Modal */}
      <Transition appear show={isAddWebsiteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddWebsiteModalOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Add New Website
                  </DialogTitle>
                  <div className="mt-4">
                    {addWebsiteMessage.text && (
                      <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
                        addWebsiteMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {addWebsiteMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{addWebsiteMessage.text}</span>
                      </div>
                    )}
                    <form onSubmit={handleAddWebsiteSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="newWebsiteName" className="block text-sm font-bold text-gray-700 mb-1">
                          Website Name *
                        </label>
                        <input
                          type="text"
                          id="newWebsiteName"
                          value={newWebsiteName}
                          onChange={(e) => setNewWebsiteName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., My New Awesome Store"
                        />
                      </div>
                      <div>
                        <label htmlFor="newWebsiteDomain" className="block text-sm font-bold text-gray-700 mb-1">
                          Website Domain *
                        </label>
                        <input
                          type="text"
                          id="newWebsiteDomain"
                          value={newWebsiteDomain}
                          onChange={(e) => setNewWebsiteDomain(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., mynewstore.com"
                        />
                         <p className="mt-1 text-xs text-gray-500">Ensure this matches the actual domain.</p>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <label htmlFor="newWebsiteIsActive" className="font-bold text-gray-700">
                          Is Active
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewWebsiteIsActive(!newWebsiteIsActive)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            newWebsiteIsActive ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              newWebsiteIsActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setIsAddWebsiteModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addWebsiteLoading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addWebsiteLoading ? 'Adding...' : 'Add Website'}
                        </button>
                      </div>
                    </form>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      </div>
    </AdminLayout>
  )
}
