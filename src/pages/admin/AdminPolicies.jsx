import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { Edit2, Save, AlertCircle, CheckCircle, FileText, Plus, X, ShieldCheck } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet',
  'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
]

export default function AdminPolicies() {
  const { websiteId } = useWebsite()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newPolicy, setNewPolicy] = useState({
    policy_type: 'privacy',
    title: '',
    slug: '',
    content: '',
    is_active: true
  })

  useEffect(() => {
    if (websiteId) {
      fetchPolicies()
    }
  }, [websiteId])

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('website_id', websiteId)
        .order('policy_type')

      if (error) throw error
      setPolicies(data || [])
    } catch (error) {
      console.error('Error fetching policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (policy) => {
    setCreating(false)
    setEditing({
      ...policy,
    })
  }

  const handleCreate = () => {
    setEditing(null)
    setCreating(true)
    setNewPolicy({
      policy_type: 'privacy',
      title: '',
      slug: '',
      content: '',
      is_active: true
    })
  }

  const handleCancelCreate = () => {
    setCreating(false)
    setNewPolicy({
      policy_type: 'privacy',
      title: '',
      slug: '',
      content: '',
      is_active: true
    })
  }

  const convertJSXToHTML = (content) => {
    return content.replace(/className=/g, 'class=')
  }

  const handleSave = async () => {
    if (!editing) return
    setMessage({ type: '', text: '' })

    try {
      const htmlContent = convertJSXToHTML(editing.content)

      const { data, error } = await supabase.rpc('admin_manage_policy', {
        operation: 'update',
        policy_id: editing.id,
        policy_data: {
          title: editing.title,
          content: htmlContent,
          is_active: editing.is_active,
          website_id: websiteId
        }
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Policy updated successfully!' })
      setEditing(null)
      fetchPolicies()
    } catch (error) {
      console.error('Error saving policy:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save policy' })
    }
  }

  const handleCreatePolicy = async () => {
    setMessage({ type: '', text: '' })

    if (!newPolicy.title || !newPolicy.slug || !newPolicy.content) {
      setMessage({ type: 'error', text: 'Please fill all required fields' })
      return
    }

    try {
      const htmlContent = convertJSXToHTML(newPolicy.content)

      const { data, error } = await supabase.rpc('admin_manage_policy', {
        operation: 'insert',
        policy_data: {
          policy_type: newPolicy.policy_type,
          title: newPolicy.title,
          slug: newPolicy.slug,
          content: htmlContent,
          is_active: newPolicy.is_active,
          website_id: websiteId
        }
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Policy created successfully!' })
      setCreating(false)
      setNewPolicy({
        policy_type: 'privacy',
        title: '',
        slug: '',
        content: '',
        is_active: true
      })
      fetchPolicies()
    } catch (error) {
      console.error('Error creating policy:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to create policy' })
    }
  }

  const toggleStatus = async (policy) => {
    try {
      const { data, error } = await supabase.rpc('admin_manage_policy', {
        operation: 'update',
        policy_id: policy.id,
        policy_data: { is_active: !policy.is_active, website_id: websiteId }
      })

      if (error) throw error
      fetchPolicies()
    } catch (error) {
      console.error('Error updating policy status:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update status' })
    }
  }

  const getPolicyIcon = (type) => {
    return <FileText size={24} className="text-blue-600" />
  }

  const getPolicyTypeName = (type) => {
    const names = {
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      refund: 'Refund Policy',
      shipping: 'Shipping & Cancellation',
    }
    return names[type] || type
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
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              Legal & Compliance
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Store <span className="text-gray-400">Policies.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Manage your terms of service, privacy, and other legal documents.</p>
          </div>
          
          {!editing && !creating && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-4 h-4" />
              Create Document
            </button>
          )}
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
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        {creating || editing ? (
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 mb-12 animate-slide-up relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
                  {creating ? <Plus size={20} /> : <Edit2 size={20} />}
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {creating ? 'Create Document' : `Update ${getPolicyTypeName(editing.policy_type)}`}
                </h2>
              </div>
              <button onClick={creating ? handleCancelCreate : () => setEditing(null)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-8 relative z-10">
              {creating && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Classification</label>
                  <select
                    value={newPolicy.policy_type}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policy_type: e.target.value })}
                    className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
                  >
                    <option value="privacy">Privacy Policy</option>
                    <option value="terms">Terms & Conditions</option>
                    <option value="refund">Refund Policy</option>
                    <option value="shipping">Shipping & Cancellation</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Title</label>
                  <input
                    type="text"
                    value={creating ? newPolicy.title : editing.title}
                    onChange={(e) => creating ? setNewPolicy({ ...newPolicy, title: e.target.value }) : setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                    placeholder="e.g. Privacy Protection Policy"
                  />
                </div>

                {creating && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SEO URL Slug</label>
                    <input
                      type="text"
                      value={newPolicy.slug}
                      onChange={(e) => setNewPolicy({ ...newPolicy, slug: e.target.value })}
                      className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                      placeholder="e.g. privacy-policy"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Content</label>
                <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-inner">
                  <ReactQuill
                    theme="snow"
                    value={creating ? newPolicy.content : editing.content}
                    onChange={(value) => creating ? setNewPolicy({ ...newPolicy, content: value }) : setEditing({ ...editing, content: value })}
                    modules={modules}
                    formats={formats}
                    className="bg-white"
                    style={{ height: '400px', marginBottom: '42px' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 px-2">
                <input
                  type="checkbox"
                  id="active_status"
                  checked={creating ? newPolicy.is_active : editing.is_active}
                  onChange={(e) => creating ? setNewPolicy({ ...newPolicy, is_active: e.target.checked }) : setEditing({ ...editing, is_active: e.target.checked })}
                  className="w-6 h-6 border-2 border-gray-100 rounded-lg text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-brand-orange"
                />
                <label htmlFor="active_status" className="text-xs font-black text-gray-900 uppercase tracking-widest cursor-pointer">
                  Activate Document immediately
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button
                  onClick={creating ? handleCreatePolicy : handleSave}
                  className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {creating ? 'Confirm & Create' : 'Save Document Changes'}
                </button>
                <button
                  onClick={creating ? handleCancelCreate : () => setEditing(null)}
                  className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em] text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.length === 0 ? (
              <div className="md:col-span-2 bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">No legal documents</h3>
                <p className="text-gray-400 font-medium mb-10">You haven't created any store policies yet.</p>
                <button
                  onClick={handleCreate}
                  className="px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all shadow-xl uppercase tracking-widest text-xs"
                >
                  Add First Policy
                </button>
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="group bg-white rounded-[3rem] p-8 border border-gray-100 hover:border-brand-orange/20 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 relative overflow-hidden flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] group-hover:bg-brand-orange group-hover:text-white flex items-center justify-center text-gray-400 transition-all duration-500 shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors">{policy.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/{policy.slug}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(policy)}
                      className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group-hover:bg-white transition-colors duration-500 min-h-[120px]">
                      <p className="text-[11px] font-bold text-gray-500 line-clamp-4 leading-relaxed uppercase tracking-wider">
                        {policy.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={() => toggleStatus(policy)}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                          policy.is_active
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      >
                        {policy.is_active ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {policy.is_active ? 'Active Document' : 'Inactive / Draft'}
                      </button>
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Modified: {new Date(policy.updated_at || policy.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Decorative blob */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/10 transition-colors pointer-events-none"></div>
                </div>
              ))
            )}
          </div>
        )}
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
        .ql-container.ql-snow { border: none !important; font-family: inherit; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f3f4f6 !important; background: #fff; padding: 1rem !important; }
        .ql-editor { padding: 2rem !important; min-height: 300px; font-size: 14px; color: #374151; }
      `}</style>
    </AdminLayout>
  )
}
