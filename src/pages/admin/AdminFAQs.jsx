import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'

export default function AdminFAQs() {
  const { websiteId } = useWebsite()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (websiteId) {
      fetchFAQs()
    }
  }, [websiteId])

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('website_id', websiteId)
        .order('display_order')

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      display_order: 0,
      is_active: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active,
    })
    setEditingId(faq.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      if (editingId) {
        const { data, error } = await supabase.rpc('admin_manage_faq', {
          operation: 'update',
          faq_id: editingId,
          faq_data: { ...formData, website_id: websiteId }
        })

        if (error) throw error
        setMessage({ type: 'success', text: 'FAQ updated successfully!' })
      } else {
        const { data, error } = await supabase.rpc('admin_manage_faq', {
          operation: 'insert',
          faq_data: { ...formData, website_id: websiteId }
        })

        if (error) throw error
        setMessage({ type: 'success', text: 'FAQ created successfully!' })
      }

      resetForm()
      fetchFAQs()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save FAQ' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const { data, error } = await supabase.rpc('admin_manage_faq', {
        operation: 'delete',
        faq_id: id
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'FAQ deleted successfully!' })
      fetchFAQs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to delete FAQ' })
    }
  }

  const toggleStatus = async (faq) => {
    try {
      const { data, error } = await supabase.rpc('admin_manage_faq', {
        operation: 'update',
        faq_id: faq.id,
        faq_data: { is_active: !faq.is_active }
      })

      if (error) throw error
      fetchFAQs()
    } catch (error) {
      console.error('Error updating FAQ status:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update status' })
    }
  }

  if (loading) {
    return (
        <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
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
              <HelpCircle className="w-3 h-3" />
              Support Content
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Store <span className="text-gray-400">FAQs.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Manage frequently asked questions for your customers.</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            Create FAQ
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
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        {/* Form Modal-like inline */}
        {showForm && (
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 mb-12 animate-slide-up relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingId ? 'Update FAQ' : 'New Entry'}
                </h2>
              </div>
              <button onClick={resetForm} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Question Content</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                  placeholder="e.g. What is your return policy?"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Answer Content</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm resize-none"
                  placeholder="Provide a clear and detailed answer..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Priority</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visibility Status</label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
                  >
                    <option value="active">Visible to Customers</option>
                    <option value="inactive">Hidden (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button
                  type="submit"
                  className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1"
                >
                  {editingId ? 'Save Changes' : 'Publish FAQ'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em] text-xs"
                >
                  Discard
                </button>
              </div>
            </form>
            {/* Decorative blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-orange/[0.03] rounded-full blur-3xl pointer-events-none"></div>
          </div>
        )}

        {/* Table List */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-20">Order</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">FAQ Question</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <HelpCircle className="w-12 h-12 text-gray-100 mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No FAQs Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  faqs.map((faq) => (
                    <tr key={faq.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <span className="font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs">
                          {faq.display_order}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors line-clamp-1">
                          {faq.question}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 line-clamp-1 opacity-60">
                          {faq.answer}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => toggleStatus(faq)}
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            faq.is_active
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {faq.is_active ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {faq.is_active ? 'Public' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
