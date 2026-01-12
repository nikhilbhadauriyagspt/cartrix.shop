import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { Edit2, Save, AlertCircle, CheckCircle, FileText, Plus, X } from 'lucide-react'
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Policies</h1>
            <p className="text-gray-600">Edit website policies and terms</p>
          </div>
          {!editing && !creating && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Policy
            </button>
          )}
        </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {creating ? (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Create New Policy
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Policy Type *
              </label>
              <select
                value={newPolicy.policy_type}
                onChange={(e) => setNewPolicy({ ...newPolicy, policy_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="privacy">Privacy Policy</option>
                <option value="terms">Terms & Conditions</option>
                <option value="refund">Refund Policy</option>
                <option value="shipping">Shipping & Cancellation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Privacy Policy"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={newPolicy.slug}
                onChange={(e) => setNewPolicy({ ...newPolicy, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., privacy-policy"
              />
              <p className="mt-1 text-sm text-gray-500">
                URL will be: /policy/{newPolicy.slug}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Content *
              </label>
              <div className="border border-gray-300 rounded-2xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={newPolicy.content}
                  onChange={(value) => setNewPolicy({ ...newPolicy, content: value })}
                  modules={modules}
                  formats={formats}
                  className="bg-white"
                  style={{ height: '400px', marginBottom: '42px' }}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPolicy.is_active}
                  onChange={(e) => setNewPolicy({ ...newPolicy, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelCreate}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleCreatePolicy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
              >
                <Save size={20} />
                Create Policy
              </button>
            </div>
          </div>
        </div>
      ) : editing ? (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Edit {getPolicyTypeName(editing.policy_type)}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Content *
              </label>
              <div className="border border-gray-300 rounded-2xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={editing.content}
                  onChange={(value) => setEditing({ ...editing, content: value })}
                  modules={modules}
                  formats={formats}
                  className="bg-white"
                  style={{ height: '400px', marginBottom: '42px' }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Tip: You can paste HTML code directly. Use "class" (or "className" - it will be auto-converted) for Tailwind CSS styling.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
              >
                <Save size={20} />
                Save Policy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {policies.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policies Yet</h3>
              <p className="text-gray-600 mb-6">Create your first policy to get started</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create First Policy
              </button>
            </div>
          ) : (
            policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getPolicyIcon(policy.policy_type)}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {policy.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Slug: /{policy.slug}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {policy.content.substring(0, 200)}...
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => toggleStatus(policy)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          policy.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(policy)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
