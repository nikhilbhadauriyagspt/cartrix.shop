import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import ImageUpload from '../../components/ImageUpload'
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Search } from 'lucide-react'

export default function AdminGuides() {
  const [guides, setGuides] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGuide, setEditingGuide] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image_url: '',
    category_id: '',
    product_id: '',
    is_published: false,
    guide_type: 'Guide',
    icon_name: 'file-text',
    read_time: 5,
    color_scheme: 'blue',
    guide_number: null,
    faqs: [],
    key_takeaways: [],
  })

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [newTakeaway, setNewTakeaway] = useState('')

  const guideTypes = ['Buying Guide', 'Comparison', 'Technical', 'Maintenance', 'Cost Analysis', 'Security', 'Efficiency', 'Environment', 'Business', 'Home Office', 'Mobile', 'Supplies', 'Upgrades', 'Optimization', 'Cost Savings', 'Guide']

  const iconOptions = ['target', 'printer', 'building', 'home', 'users', 'zap', 'wrench', 'package', 'shield', 'settings', 'globe', 'file-text', 'clock', 'recycle', 'chart', 'lock', 'activity', 'circle-alert', 'dollar-sign', 'award']

  const colorOptions = ['blue', 'purple', 'green', 'orange', 'teal', 'yellow', 'indigo', 'rose', 'cyan', 'emerald', 'slate', 'amber', 'lime', 'pink', 'violet', 'red']

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchGuides()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchGuides = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*, categories(*)')
        .order('guide_number', { ascending: true, nullsFirst: false })

      if (error) throw error
      setGuides(data || [])
    } catch (error) {
      console.error('Error fetching guides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const dataToSave = {
        ...formData,
        guide_number: formData.guide_number ? parseInt(formData.guide_number) : null,
        read_time: parseInt(formData.read_time) || 5,
        updated_at: new Date().toISOString(),
      }

      if (editingGuide) {
        const { error } = await supabase
          .from('guides')
          .update(dataToSave)
          .eq('id', editingGuide.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('guides')
          .insert([dataToSave])

        if (error) throw error
      }

      setShowModal(false)
      setEditingGuide(null)
      resetForm()
      fetchGuides()
    } catch (error) {
      console.error('Error saving guide:', error)
      alert('Failed to save guide: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this guide?')) return

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchGuides()
    } catch (error) {
      console.error('Error deleting guide:', error)
      alert('Failed to delete guide')
    }
  }

  const togglePublishStatus = async (guide) => {
    try {
      const { error } = await supabase
        .from('guides')
        .update({ is_published: !guide.is_published })
        .eq('id', guide.id)

      if (error) throw error
      fetchGuides()
    } catch (error) {
      console.error('Error toggling publish status:', error)
      alert('Failed to toggle publish status')
    }
  }

  const openModal = (guide = null) => {
    if (guide) {
      setEditingGuide(guide)
      setFormData({
        title: guide.title || '',
        slug: guide.slug || '',
        description: guide.description || '',
        content: guide.content || '',
        image_url: guide.image_url || '',
        category_id: guide.category_id || '',
        product_id: guide.product_id || '',
        is_published: guide.is_published || false,
        guide_type: guide.guide_type || 'Guide',
        icon_name: guide.icon_name || 'file-text',
        read_time: guide.read_time || 5,
        color_scheme: guide.color_scheme || 'blue',
        guide_number: guide.guide_number || null,
        faqs: guide.faqs || [],
        key_takeaways: guide.key_takeaways || [],
      })
    } else {
      resetForm()
    }
    setActiveTab('basic')
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      image_url: '',
      category_id: '',
      product_id: '',
      is_published: false,
      guide_type: 'Guide',
      icon_name: 'file-text',
      read_time: 5,
      color_scheme: 'blue',
      guide_number: null,
      faqs: [],
      key_takeaways: [],
    })
  }

  const handleImageUpload = (url) => {
    setFormData({ ...formData, image_url: url })
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFormData({ ...formData, faqs: [...formData.faqs, newFaq] })
      setNewFaq({ question: '', answer: '' })
    }
  }

  const removeFaq = (index) => {
    const newFaqs = [...formData.faqs]
    newFaqs.splice(index, 1)
    setFormData({ ...formData, faqs: newFaqs })
  }

  const addTakeaway = () => {
    if (newTakeaway.trim()) {
      setFormData({ ...formData, key_takeaways: [...formData.key_takeaways, newTakeaway.trim()] })
      setNewTakeaway('')
    }
  }

  const removeTakeaway = (index) => {
    const newTakeaways = [...formData.key_takeaways]
    newTakeaways.splice(index, 1)
    setFormData({ ...formData, key_takeaways: newTakeaways })
  }

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'settings', label: 'Settings' },
    { id: 'extras', label: 'FAQs & Takeaways' },
  ]

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-slate-900">Guide Management</h2>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-sky-700 hover:to-cyan-700 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Add Guide</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Guide</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredGuides.map((guide) => (
                    <tr key={guide.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {guide.guide_number || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={guide.image_url}
                            alt={guide.title}
                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{guide.title}</p>
                            <p className="text-sm text-slate-500">{guide.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded">
                          {guide.guide_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {guide.categories?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublishStatus(guide)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-2xl text-sm font-bold transition-colors ${
                            guide.is_published
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {guide.is_published ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Published
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(guide)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-2xl transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guide.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                            title="Delete"
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full my-8">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {editingGuide ? 'Edit Guide' : 'Add New Guide'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingGuide(null)
                      resetForm()
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <ImageUpload
                      bucket="assets"
                      folder="guides"
                      currentImage={formData.image_url}
                      onUploadComplete={handleImageUpload}
                      label="Guide Image *"
                    />

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Guide Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={(e) => {
                          handleChange(e)
                          if (!editingGuide) {
                            setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Enter guide title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="guide-slug"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        required
                        rows="2"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        placeholder="Brief description of the guide"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={(e) => {
                          handleChange(e)
                          setFormData(prev => ({ ...prev, product_id: '' }))
                        }}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Product (Optional)
                      </label>
                      <select
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        disabled={!formData.category_id}
                      >
                        <option value="">Select a product</option>
                        {products
                          .filter(product => !formData.category_id || product.category_id === formData.category_id)
                          .map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Select a category first to see related products
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Content * (HTML supported)
                      </label>
                      <textarea
                        name="content"
                        required
                        rows="12"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none font-mono text-sm"
                        placeholder="Full guide content with HTML formatting..."
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        You can use HTML tags like &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, etc.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Guide Type
                        </label>
                        <select
                          name="guide_type"
                          value={formData.guide_type}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                          {guideTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Guide Number
                        </label>
                        <input
                          type="number"
                          name="guide_number"
                          min="1"
                          value={formData.guide_number || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Icon Name
                        </label>
                        <select
                          name="icon_name"
                          value={formData.icon_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                          {iconOptions.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Color Scheme
                        </label>
                        <select
                          name="color_scheme"
                          value={formData.color_scheme}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                          {colorOptions.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Read Time (minutes)
                      </label>
                      <input
                        type="number"
                        name="read_time"
                        min="1"
                        value={formData.read_time}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="5"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_published"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleChange}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor="is_published" className="ml-2 text-sm font-bold text-slate-700">
                        Publish Guide
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'extras' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        FAQs
                      </label>
                      <div className="space-y-3 mb-3">
                        {formData.faqs.map((faq, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-2xl">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-sm text-slate-900">Q: {faq.question}</p>
                              <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-slate-600">A: {faq.answer}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder="FAQ Question"
                        />
                        <textarea
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                          rows="2"
                          placeholder="FAQ Answer"
                        />
                        <button
                          type="button"
                          onClick={addFaq}
                          className="w-full px-4 py-2 bg-sky-600 text-white rounded-2xl hover:bg-sky-700"
                        >
                          Add FAQ
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Key Takeaways
                      </label>
                      <div className="space-y-2 mb-2">
                        {formData.key_takeaways.map((takeaway, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <span className="flex-1 text-sm">{takeaway}</span>
                            <button
                              type="button"
                              onClick={() => removeTakeaway(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTakeaway}
                          onChange={(e) => setNewTakeaway(e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder="Add a key takeaway"
                        />
                        <button
                          type="button"
                          onClick={addTakeaway}
                          className="px-4 py-2 bg-sky-600 text-white rounded-2xl hover:bg-sky-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
                  <button
                    type="submit"
                    disabled={!formData.image_url}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-sky-700 hover:to-cyan-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingGuide ? 'Update Guide' : 'Add Guide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingGuide(null)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
