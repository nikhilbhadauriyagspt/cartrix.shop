import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Copy,
  Tag,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        const { data, error } = await supabase.rpc('admin_manage_category', {
          operation: 'update',
          category_id: editingCategory.id,
          category_data: formData
        })

        if (error) throw error
      } else {
        const { data, error } = await supabase.rpc('admin_manage_category', {
          operation: 'insert',
          category_data: formData
        })

        if (error) throw error
      }

      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This may affect products using this category.')) return

    try {
      const { data, error } = await supabase.rpc('admin_manage_category', {
        operation: 'delete',
        category_id: id
      })

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const toggleCategoryStatus = async (category) => {
    try {
      const { data, error } = await supabase.rpc('admin_manage_category', {
        operation: 'update',
        category_id: category.id,
        category_data: { is_active: !category.is_active }
      })

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error toggling category status:', error)
      alert('Failed to toggle category status')
    }
  }

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        is_active: category.is_active !== undefined ? category.is_active : true,
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      is_active: true,
    })
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Category ID copied to clipboard!')
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <Tag className="w-3 h-3" />
              Taxonomy Management
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Product <span className="text-gray-400">Categories.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Organize your store catalog for better discovery.</p>
          </div>
          
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            Create Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-10 transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search by category name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[3rem] h-24 animate-pulse border border-gray-50" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
            <Tag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-400 font-medium">Try a different search or create a new category.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identifier</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visibility</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-orange group-hover:text-white transition-all duration-500 shadow-inner">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors">{category.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            {category.id.slice(0, 8).toUpperCase()}
                          </span>
                          <button
                            onClick={() => copyToClipboard(category.id)}
                            className="p-2 text-gray-300 hover:text-brand-orange transition-colors"
                            title="Copy full ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => toggleCategoryStatus(category)}
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            category.is_active
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {category.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {category.is_active ? 'Public' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button
                            onClick={() => openModal(category)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Redesign */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col">
              
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                    <Tag className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingCategory ? 'Update Category' : 'New Category'}
                  </h3>
                </div>
                <button onClick={() => { setShowModal(false); setEditingCategory(null); resetForm(); }} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      handleChange(e)
                      if (!editingCategory) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                      }
                    }}
                    className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                    placeholder="e.g. Inkjet Printers"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                    placeholder="inkjet-printers"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm resize-none"
                    placeholder="Describe this category collection..."
                  />
                </div>

                <div className="flex items-center gap-4 px-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-6 h-6 border-2 border-gray-100 rounded-lg text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-brand-orange"
                    />
                    <label htmlFor="is_active" className="text-xs font-black text-gray-900 uppercase tracking-widest cursor-pointer">
                      Make public on store
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-50">
                  <button
                    type="submit"
                    className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1"
                  >
                    {editingCategory ? 'Save Changes' : 'Confirm & Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingCategory(null); resetForm(); }}
                    className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em] text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
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
      `}</style>
    </AdminLayout>
  )
}