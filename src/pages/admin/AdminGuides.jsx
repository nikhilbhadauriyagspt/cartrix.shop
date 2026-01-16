import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import ImageUpload from '../../components/ImageUpload'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Sparkles, 
  ArrowRight,
  Clock,
  Tag,
  Settings,
  HelpCircle,
  Award
} from 'lucide-react'

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
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Knowledge Base
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Content <span className="text-gray-400">Guides.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Create and manage detailed buying guides and technical documentation.</p>
          </div>
          
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            New Guide
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-10 transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search by title, slug or description..."
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
        ) : filteredGuides.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
            <Plus className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Library is empty</h3>
            <p className="text-gray-400 font-medium">Try a different search or create your first guide.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-16">#</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Guide Info</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type & Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGuides.map((guide) => (
                    <tr key={guide.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <span className="font-black text-gray-300 text-xs">{guide.guide_number || '-'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={guide.image_url}
                              alt={guide.title}
                              className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors line-clamp-1">{guide.title}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/{guide.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1.5">
                          <span className="inline-block px-3 py-1 bg-gray-50 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                            {guide.guide_type}
                          </span>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{guide.categories?.name || 'Knowledge'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => togglePublishStatus(guide)}
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            guide.is_published
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {guide.is_published ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {guide.is_published ? 'Live' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button
                            onClick={() => openModal(guide)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guide.id)}
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
            <div className="relative bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[95vh]">
              
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingGuide ? 'Update Guide' : 'New Publication'}
                  </h3>
                  <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-[10px] font-black uppercase tracking-widest pb-2 transition-all relative whitespace-nowrap ${
                          activeTab === tab.id ? 'text-brand-orange' : 'text-gray-300 hover:text-gray-500'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setEditingGuide(null); resetForm(); }} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {activeTab === 'basic' && (
                  <div className="space-y-10">
                    <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-dashed border-gray-200">
                      <ImageUpload bucket="assets" folder="guides" currentImage={formData.image_url} onUploadComplete={handleImageUpload} label="Feature Artwork (16:9 preferred)" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guide Headline</label>
                        <input type="text" name="title" required value={formData.title} onChange={(e) => { handleChange(e); if (!editingGuide) setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) })) }} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-xl tracking-tight" placeholder="e.g. The Ultimate 2024 Printing Guide" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                        <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm" placeholder="ultimate-printing-guide" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catalog Category</label>
                        <select name="category_id" value={formData.category_id} onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, product_id: '' })) }} className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm appearance-none">
                          <option value="">Select Category</option>
                          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Introduction</label>
                        <textarea name="description" required rows="2" value={formData.description} onChange={handleChange} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm resize-none" placeholder="Provide a hook for your readers..." />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Article Body (HTML Supported)</label>
                    <textarea name="content" required rows="15" value={formData.content} onChange={handleChange} className="w-full px-10 py-10 rounded-[3rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-medium text-lg leading-relaxed resize-none shadow-inner custom-scrollbar" placeholder="Start writing your guide here..." />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Publication Type</label>
                      <select name="guide_type" value={formData.guide_type} onChange={handleChange} className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none">
                        {guideTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Read Time (Min)</label>
                      <input type="number" name="read_time" min="1" value={formData.read_time} onChange={handleChange} className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-sm" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Icon</label>
                      <select name="icon_name" value={formData.icon_name} onChange={handleChange} className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none">
                        {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Theme Hue</label>
                      <select name="color_scheme" value={formData.color_scheme} onChange={handleChange} className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none">
                        {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-4 px-2">
                      <input type="checkbox" id="pub_status" name="is_published" checked={formData.is_published} onChange={handleChange} className="w-6 h-6 border-2 border-gray-100 rounded-lg text-brand-orange focus:ring-brand-orange/20 accent-brand-orange" />
                      <label htmlFor="pub_status" className="text-xs font-black text-gray-900 uppercase tracking-widest cursor-pointer">Live Publication</label>
                    </div>
                  </div>
                )}

                {activeTab === 'extras' && (
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Supplemental FAQs</h4>
                      <div className="grid gap-4">
                        {formData.faqs.map((faq, idx) => (
                          <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex justify-between items-start">
                            <div>
                              <p className="text-xs font-black text-gray-900 uppercase tracking-tight mb-1">Q: {faq.question}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">A: {faq.answer}</p>
                            </div>
                            <button type="button" onClick={() => removeFaq(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                      <div className="p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
                        <input type="text" value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-xs" placeholder="Question Title" />
                        <textarea value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-xs resize-none" rows="2" placeholder="Answer Details" />
                        <button type="button" onClick={addFaq} className="w-full py-4 bg-black text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-orange transition-all">Add to list</button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Crucial Takeaways</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.key_takeaways.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                            <button type="button" onClick={() => removeTakeaway(idx)}><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <input type="text" value={newTakeaway} onChange={(e) => setNewTakeaway(e.target.value)} className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-xs" placeholder="Core insight..." />
                        <button type="button" onClick={addTakeaway} className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-orange transition-all"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button type="submit" onClick={handleSubmit} disabled={!formData.image_url} className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1 disabled:opacity-50">
                  {editingGuide ? 'Save Publication' : 'Launch Publication'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingGuide(null); resetForm(); }} className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em] text-xs">Discard</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </AdminLayout>
  )
}