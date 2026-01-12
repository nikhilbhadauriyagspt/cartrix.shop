import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage FAQs</h1>
            <p className="text-gray-600">Add, edit, or remove frequently asked questions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add FAQ
          </button>
        </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the question"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the answer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
              >
                <Save size={20} />
                {editingId ? 'Update FAQ' : 'Add FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Question</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faqs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No FAQs found. Add your first FAQ to get started.
                </td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{faq.display_order}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{faq.question}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(faq)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        faq.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </AdminLayout>
  )
}
