import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import ImageUpload from '../../components/ImageUpload'
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Search } from 'lucide-react'

export default function AdminBlogs() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    published: false,
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingBlog.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([{ ...formData, author_id: user.id }])

        if (error) throw error
      }

      setShowModal(false)
      setEditingBlog(null)
      resetForm()
      fetchBlogs()
    } catch (error) {
      console.error('Error saving blog:', error)
      alert('Failed to save blog: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    }
  }

  const togglePublished = async (blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !blog.published, updated_at: new Date().toISOString() })
        .eq('id', blog.id)

      if (error) throw error
      fetchBlogs()
    } catch (error) {
      console.error('Error updating blog:', error)
      alert('Failed to update blog status')
    }
  }

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog)
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        image_url: blog.image_url,
        published: blog.published,
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image_url: '',
      published: false,
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

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-slate-900">Blog Management</h2>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-sky-700 hover:to-cyan-700 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Add Blog Post</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs by title or slug..."
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Blog Post</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Excerpt</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{blog.title}</p>
                            <p className="text-sm text-slate-500">{blog.slug}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(blog.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 line-clamp-2">{blog.excerpt}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublished(blog)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-2xl text-sm font-bold transition-colors ${
                            blog.published
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {blog.published ? (
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
                            onClick={() => openModal(blog)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-2xl transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingBlog(null)
                      resetForm()
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <ImageUpload
                  bucket="blog-images"
                  folder="posts"
                  currentImage={formData.image_url}
                  onUploadComplete={handleImageUpload}
                  label="Featured Image *"
                />

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      handleChange(e)
                      if (!editingBlog) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter blog title"
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
                    placeholder="blog-post-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    name="excerpt"
                    required
                    rows="2"
                    value={formData.excerpt}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    placeholder="A short summary of the blog post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    required
                    rows="8"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    placeholder="Full blog content"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <label htmlFor="published" className="ml-2 text-sm font-bold text-slate-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={!formData.image_url}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl hover:from-sky-700 hover:to-cyan-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingBlog ? 'Update Blog Post' : 'Add Blog Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingBlog(null)
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
