import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import ImageUpload from '../../components/ImageUpload'
import { useWebsite } from '../../contexts/WebsiteContext'
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Search, Image as ImageIcon, Trash, Upload, Download } from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsite()
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
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
        if (!data?.success) throw new Error(data?.error || 'Failed to update product')
      } else {
        const { data, error } = await supabase.rpc('admin_manage_product', {
          operation: 'insert',
          product_data: productData
        })

        if (error) throw error
        if (!data?.success) throw new Error(data?.error || 'Failed to create product')
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
      if (!data?.success) throw new Error(data?.error || 'Failed to delete product')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product: ' + error.message)
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

  const handleImageUpload = (url) => {
    setFormData({ ...formData, image_url: url })
  }

  const handleGalleryImageUpload = (url) => {
    setFormData({ ...formData, images: [...formData.images, url] })
  }

  const removeGalleryImage = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const downloadCSVTemplate = () => {
    const template = `name,description,price,category_id,brand,image_url
HP LaserJet Pro,Professional laser printer,299.99,CATEGORY_ID_HERE,HP,https://example.com/image.jpg
Canon Inkjet,Affordable inkjet printer,149.99,CATEGORY_ID_HERE,Canon,https://example.com/image.jpg`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_upload_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSVLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkUploadStatus({ uploading: true, success: 0, failed: 0, errors: [] })

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result
        const lines = csv.split('\n').filter(line => line.trim())
        const headers = parseCSVLine(lines[0])

        let successCount = 0
        let failedCount = 0
        const errors = []

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          try {
            const values = parseCSVLine(lines[i])
            const product = {}

            headers.forEach((header, index) => {
              product[header] = values[index] || ''
            })

            if (!product.name || !product.category_id) {
              throw new Error('Missing required fields: name and category_id')
            }

            if (product.category_id === 'CATEGORY_ID_HERE') {
              throw new Error('Please replace CATEGORY_ID_HERE with an actual category ID')
            }

            const productData = {
              name: product.name,
              description: product.description || '',
              price: parseFloat(product.price) || 0,
              category_id: product.category_id,
              brand: product.brand || '',
              image_url: product.image_url || '',
              images: '[]'
            }

            const { data, error } = await supabase.rpc('admin_manage_product', {
              operation: 'insert',
              product_data: productData
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.error || 'Failed to insert product')
            successCount++
          } catch (err) {
            failedCount++
            errors.push(`Row ${i + 1}: ${err.message}`)
          }
        }

        setBulkUploadStatus({
          uploading: false,
          success: successCount,
          failed: failedCount,
          errors
        })

        if (successCount > 0) {
          fetchProducts()
        }
      } catch (err) {
        setBulkUploadStatus({
          uploading: false,
          success: 0,
          failed: 0,
          errors: ['Failed to parse CSV file: ' + err.message]
        })
      }
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'images', label: 'Images' }
  ]

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-slate-900">Product Management</h2>
            <div className="flex gap-2">
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-colors font-bold"
              >
                <Download className="w-5 h-5" />
                <span>Download Template</span>
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors font-bold cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Bulk Upload</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-sky-700 hover:to-cyan-700 transition-colors font-bold"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-2-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.slug}</p>
                            {product.is_featured && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {product.categories?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {product.brand || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">${parseFloat(product.price).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-2xl transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
            <div className="bg-white rounded-3xl max-w-4xl w-full my-8">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
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
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
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
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-2-primary-500"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        required
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-2-primary-500"
                        placeholder="Enter brand name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category_id"
                        required
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-2-primary-500"
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
                        Description *
                      </label>
                      <textarea
                        name="description"
                        required
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-2-primary-500 resize-none"
                        placeholder="Enter product description"
                      />
                    </div>

                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-2-primary-500"
                        placeholder="0.00"
                      />
                    </div>

                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="space-y-6">
                    <div>
                      <ImageUpload
                        bucket="product-images"
                        folder="products"
                        currentImage={formData.image_url}
                        onUploadComplete={handleImageUpload}
                        label="Main Product Image (PNG or JPG only) *"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Product Gallery (Optional)
                      </label>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded-2xl border-2 border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <ImageUpload
                        bucket="product-images"
                        folder="products"
                        onUploadComplete={handleGalleryImageUpload}
                        label="Add Gallery Image (PNG or JPG only)"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
                  <button
                    type="submit"
                    disabled={!formData.image_url}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-sky-700 hover:to-cyan-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
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

        {(bulkUploadStatus.uploading || bulkUploadStatus.success > 0 || bulkUploadStatus.failed > 0) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-900">
                  {bulkUploadStatus.uploading ? 'Uploading Products...' : 'Upload Complete'}
                </h3>
                {!bulkUploadStatus.uploading && (
                  <button
                    onClick={() => setBulkUploadStatus({ uploading: false, success: 0, failed: 0, errors: [] })}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {bulkUploadStatus.uploading ? (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600 mb-4"></div>
                  <p className="text-slate-600">Processing your CSV file...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                      <p className="text-green-600 text-sm font-bold mb-1">Successful</p>
                      <p className="text-3xl font-bold text-green-700">{bulkUploadStatus.success}</p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                      <p className="text-red-600 text-sm font-bold mb-1">Failed</p>
                      <p className="text-3xl font-bold text-red-700">{bulkUploadStatus.failed}</p>
                    </div>
                  </div>

                  {bulkUploadStatus.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-h-64 overflow-y-auto">
                      <p className="text-red-700 font-bold mb-2">Errors:</p>
                      <ul className="space-y-1">
                        {bulkUploadStatus.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => setBulkUploadStatus({ uploading: false, success: 0, failed: 0, errors: [] })}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-primary-700 hover:to-primary-600 transition-colors font-bold"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
