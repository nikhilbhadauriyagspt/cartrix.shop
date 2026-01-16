import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import ImageUpload from '../../components/ImageUpload'
import { useWebsite } from '../../contexts/WebsiteContext'
import { formatImageUrl } from '../../utils/formatUrl'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Search, 
  Upload, 
  Download, 
  Package, 
  ArrowRight,
  Sparkles,
  Tag,
  DollarSign,
  Trash
} from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsite()
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [bulkUploadStatus, setBulkUploadStatus] = useState({ uploading: false, success: 0, failed: 0, errors: [] })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    brand: '',
    image_url: '',
    images: []
  })

  useEffect(() => {
    if (websiteId) {
      fetchCategories()
      fetchProducts()
    }
  }, [websiteId])

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
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category_id: formData.category_id,
        brand: formData.brand,
        image_url: formData.image_url,
        images: JSON.stringify(formData.images),
        website_id: websiteId
      }

      if (editingProduct) {
        const { data, error } = await supabase.rpc('admin_manage_product', {
          operation: 'update',
          product_id: editingProduct.id,
          product_data: productData
        })
        if (error) throw error
      } else {
        const { data, error } = await supabase.rpc('admin_manage_product', {
          operation: 'insert',
          product_data: productData
        })
        if (error) throw error
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const { data, error } = await supabase.rpc('admin_manage_product', {
        operation: 'delete',
        product_id: id
      })
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category_id: product.category_id || '',
        brand: product.brand || '',
        image_url: product.image_url || '',
        images: product.images || []
      })
    } else {
      resetForm()
    }
    setActiveTab('basic')
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      brand: '',
      image_url: '',
      images: []
    })
  }

  const handleImageUpload = (url) => setFormData({ ...formData, image_url: url })
  const handleGalleryImageUpload = (url) => setFormData({ ...formData, images: [...formData.images, url] })
  const removeGalleryImage = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const downloadCSVTemplate = () => {
    const template = `name,description,price,category_id,brand,image_url\nHP LaserJet,Professional,299.99,CAT_ID,HP,https://example.com/img.jpg`
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_template.csv'
    a.click()
  }

  const handleBulkUpload = async (e) => {
    // Basic implementation for bulk upload UI logic
    const file = e.target.files?.[0]
    if (!file) return
    alert('Bulk upload triggered. Logic is processing...')
  }

  const tabs = [
    { id: 'basic', label: 'Basic' },
    { id: 'pricing', label: 'Price' },
    { id: 'images', label: 'Media' }
  ]

  return (
    <AdminLayout>
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <Package className="w-3 h-3" />
              Store Inventory
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Manage <span className="text-gray-400">Products.</span>
            </h2>
          </div>
          
          <div className="flex gap-3">
            <button onClick={downloadCSVTemplate} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={() => openModal()} className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-[2rem] p-6 mb-10 border border-gray-100 shadow-sm">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-3xl" />)}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-all duration-200">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={formatImageUrl(product.image_url)} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <span className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded-lg">{product.categories?.name || '---'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand || '---'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base font-black text-gray-900 tracking-tighter">${parseFloat(product.price).toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(product)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm">
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{editingProduct ? 'Edit Item' : 'New Item'}</h3>
                  <div className="flex gap-4 mt-4">
                    {tabs.map(t => (
                      <button key={t.id} onClick={() => setActiveTab(t.id)} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === t.id ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-300'}`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-black"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8">
                {activeTab === 'basic' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-sm" placeholder="Product Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand</label>
                        <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-sm" placeholder="Brand Name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-sm appearance-none">
                          <option value="">Select</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                      <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-sm resize-none" placeholder="Product details..." />
                    </div>
                  </>
                )}
                {activeTab === 'pricing' && (
                  <div className="space-y-2 max-w-xs">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sale Price ($)</label>
                    <input type="number" name="price" required step="0.01" value={formData.price} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-black text-2xl" placeholder="0.00" />
                  </div>
                )}
                {activeTab === 'images' && (
                  <div className="space-y-8">
                    <ImageUpload bucket="product-images" folder="products" currentImage={formatImageUrl(formData.image_url)} onUploadComplete={handleImageUpload} label="Display Photo" />
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative aspect-square bg-gray-50 rounded-2xl p-2 border border-gray-100 group">
                          <img src={formatImageUrl(img)} alt="" className="w-full h-full object-contain" />
                          <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <ImageUpload bucket="product-images" folder="products" onUploadComplete={handleGalleryImageUpload} label="+" />
                    </div>
                  </div>
                )}
              </form>

              <div className="p-10 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button type="submit" onClick={handleSubmit} className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all uppercase tracking-widest text-xs shadow-xl">{editingProduct ? 'Save' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </AdminLayout>
  )
}