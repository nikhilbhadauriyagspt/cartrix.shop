import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import ImageUpload from '../../components/ImageUpload'
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Search, FileText, Sparkles, ArrowRight } from 'lucide-react'

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
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <FileText className="w-3 h-3" />
              Editorial Content
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Store <span className="text-gray-400">Journal.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Create and manage your brand stories and announcements.</p>
          </div>
          
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-brand-orange transition-all font-black text-[10px] uppercase tracking-widest shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            Write Article
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-10 transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search articles by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[3rem] h-32 animate-pulse border border-gray-50" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-400 font-medium">Your journal is currently empty. Start writing your first story.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Article</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Excerpt Preview</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visibility</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={blog.image_url}
                              alt={blog.title}
                              className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors line-clamp-1">{blog.title}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{new Date(blog.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 max-w-xs">
                        <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed uppercase tracking-wider">{blog.excerpt}</p>
                      </td>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => togglePublished(blog)}
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            blog.published
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {blog.published ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {blog.published ? 'Live' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button
                            onClick={() => openModal(blog)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
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
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {editingBlog ? 'Edit Story' : 'New Story'}
                  </h3>
                </div>
                <button onClick={() => { setShowModal(false); setEditingBlog(null); resetForm(); }} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-dashed border-gray-200">
                  <ImageUpload
                    bucket="blog-images"
                    folder="posts"
                    currentImage={formData.image_url}
                    onUploadComplete={handleImageUpload}
                    label="Cover Image (High Resolution preferred) *"
                  />
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Article Title</label>
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
                      className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-xl tracking-tight"
                      placeholder="Enter a compelling title..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SEO URL Slug</label>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-8 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
                      placeholder="story-url-slug"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Article Excerpt</label>
                    <textarea
                      name="excerpt"
                      required
                      rows="2"
                      value={formData.excerpt}
                      onChange={handleChange}
                      className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm resize-none"
                      placeholder="A brief summary to hook readers..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Content</label>
                    <textarea
                      name="content"
                      required
                      rows="12"
                      value={formData.content}
                      onChange={handleChange}
                      className="w-full px-10 py-10 rounded-[3rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-medium text-lg leading-relaxed resize-none shadow-inner custom-scrollbar"
                      placeholder="Start telling your story..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 px-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="published"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                      className="w-6 h-6 border-2 border-gray-100 rounded-lg text-brand-orange focus:ring-brand-orange/20 cursor-pointer accent-brand-orange"
                    />
                    <label htmlFor="published" className="text-xs font-black text-gray-900 uppercase tracking-widest cursor-pointer">
                      Publish Live Now
                    </label>
                  </div>
                </div>
              </form>

              <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!formData.image_url}
                  className="flex-1 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-[0.2em] text-xs transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {editingBlog ? 'Update Story' : 'Publish Story'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingBlog(null); resetForm(); }}
                  className="px-10 py-5 bg-white text-gray-400 font-black rounded-2xl border border-gray-200 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em] text-xs"
                >
                  Discard
                </button>
              </div>
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
