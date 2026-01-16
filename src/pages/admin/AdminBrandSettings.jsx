import { useState, useEffect, Fragment } from 'react'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { formatImageUrl } from '../../utils/formatUrl'
import { 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Bell, 
  PlusCircle, 
  Globe, 
  Palette, 
  Sparkles,
  ArrowRight,
  Info,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

export default function AdminBrandSettings() {
  const { websiteId, refreshWebsites, currentWebsite } = useWebsite()
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
    if (admin?.id) {
      fetchSettings()
      fetchAllWebsites()
    }
  }, [websiteId, admin?.id])

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
        website_id: websiteId
      }

      const { data, error } = await supabase
        .rpc('admin_upsert_site_settings', {
          settings_data: settingsData
        })

      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Failed to save settings')

      setMessage({ type: 'success', text: 'Brand settings updated!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
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
        p_id: null,
        p_name: newWebsiteName,
        p_domain: newWebsiteDomain,
        p_is_active: newWebsiteIsActive,
        p_config: {}
      })

      if (error) throw error

      setAddWebsiteMessage({ type: 'success', text: `Website "${newWebsiteName}" created!` })
      setNewWebsiteName('')
      setNewWebsiteDomain('')
      setNewWebsiteIsActive(true)
      fetchAllWebsites()
      refreshWebsites();
      setTimeout(() => {
        setIsAddWebsiteModalOpen(false)
        setAddWebsiteMessage({ type: '', text: '' })
      }, 2000);
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
              <Palette className="w-3 h-3" />
              Brand Identity
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Setup <span className="text-gray-400">Environment.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Manage global brands and website-specific configurations.</p>
          </div>
          
          <button
            onClick={() => setIsAddWebsiteModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Website
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
          
          {/* Website Management */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
              <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Connected Websites</h3>
                <span className="bg-white px-3 py-1 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">{allWebsites.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Store Name</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Primary Domain</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Visibility</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Identifier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allWebsites.map((website) => (
                      <tr key={website.id} className={`group transition-colors duration-300 ${website.id === websiteId ? 'bg-brand-orange/[0.02]' : 'hover:bg-gray-50'}`}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm border ${
                              website.id === websiteId ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-400 border-gray-100'
                            }`}>
                              {website.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{website.name}</p>
                              {website.id === websiteId && <p className="text-[8px] font-black text-brand-orange uppercase tracking-widest">Current Active</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <a href={`https://${website.domain}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-gray-400 hover:text-brand-orange flex items-center gap-1.5 uppercase tracking-widest transition-colors">
                            {website.domain} <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            website.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {website.is_active ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="font-mono text-[9px] font-black text-gray-300 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase">
                            {website.id.slice(0, 8)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detailed Brand Settings */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Identity Settings</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configuring <span className="text-brand-orange">{currentWebsite?.name}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Name</label>
                  <input type="text" name="brand_name" required value={settings.brand_name} onChange={handleChange} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="e.g. Printer Pro" />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Resource URL</label>
                  <div className="flex items-center gap-4">
                    <input type="url" name="brand_logo" value={settings.brand_logo} onChange={handleChange} className="flex-1 px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="https://example.com/logo.png" />
                    {settings.brand_logo && (
                      <div className="w-16 h-16 rounded-2xl bg-[#F9FAFB] border border-gray-100 p-2 flex items-center justify-center overflow-hidden shadow-sm">
                        <img src={formatImageUrl(settings.brand_logo)} alt="Logo Preview" className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inquiry Email</label>
                  <input type="email" name="contact_email" required value={settings.contact_email} onChange={handleChange} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="info@company.com" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Phone</label>
                  <input type="tel" name="contact_phone" required value={settings.contact_phone} onChange={handleChange} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">HQ Address</label>
                  <textarea name="address" rows="3" value={settings.address} onChange={handleChange} className="w-full px-8 py-5 rounded-[2.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm resize-none" placeholder="Enter physical business address..." />
                </div>
              </div>

              {/* Announcement Bar Section */}
              <div className="pt-12 border-t border-gray-50 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Broadcast Banner</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Global announcement bar settings</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAnnouncement}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 ${
                      settings.announcement_enabled ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${
                      settings.announcement_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className={`space-y-3 transition-all duration-500 ${settings.announcement_enabled ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea
                    name="announcement_text"
                    value={settings.announcement_text || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm resize-none"
                    placeholder="e.g., Free Shipping on Orders Over $500 | Limited Time Offer"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block mr-2 align-middle"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline-block mr-2 align-middle" />
                      Save Identity
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden sticky top-32">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Info className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-lg font-black uppercase tracking-widest">Multi-Store</h3>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Architecture</p>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                      Settings on this page are isolated per website. Use the global selector in the header to switch between different store instances.
                    </p>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Status</p>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                      Changes made to brand name or announcement bar reflect instantly across all customer-facing pages of the active website.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
            </div>
          </div>

        </div>

        {/* Add Website Modal */}
        <Transition appear show={isAddWebsiteModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[150]" onClose={() => setIsAddWebsiteModalOpen(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-6 text-center">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-[3.5rem] bg-white p-12 text-left align-middle shadow-2xl transition-all border border-gray-100">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                          <Globe className="w-6 h-6" />
                        </div>
                        <DialogTitle as="h3" className="text-2xl font-black text-gray-900 tracking-tight">
                          New Website
                        </DialogTitle>
                      </div>
                      <button onClick={() => setIsAddWebsiteModalOpen(false)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {addWebsiteMessage.text && (
                      <div className={`mb-8 p-5 rounded-[2rem] border flex items-center gap-4 animate-slide-up shadow-sm ${
                        addWebsiteMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm ${
                          addWebsiteMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {addWebsiteMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{addWebsiteMessage.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleAddWebsiteSubmit} className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Website Name</label>
                        <input type="text" value={newWebsiteName} onChange={(e) => setNewWebsiteName(e.target.value)} required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="e.g. My New Awesome Store" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Website Domain</label>
                        <input type="text" value={newWebsiteDomain} onChange={(e) => setNewWebsiteDomain(e.target.value)} required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="e.g. mynewstore.com" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ensure this matches the production hostname.</p>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <div>
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Status</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enable website instantly</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewWebsiteIsActive(!newWebsiteIsActive)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 ${
                            newWebsiteIsActive ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-500 ${
                            newWebsiteIsActive ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex gap-4 pt-6 border-t border-gray-50">
                        <button
                          type="submit"
                          disabled={addWebsiteLoading}
                          className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1 disabled:opacity-50"
                        >
                          {addWebsiteLoading ? 'Creating...' : 'Create Website'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddWebsiteModalOpen(false)}
                          className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em] text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

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
