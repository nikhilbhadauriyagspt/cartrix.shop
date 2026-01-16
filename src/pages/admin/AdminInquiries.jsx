import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Trash2,
  Eye,
  XCircle,
  Filter,
  ChevronDown,
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react'

export default function AdminInquiries() {
  const { websiteId } = useWebsite()
  const [inquiries, setInquiries] = useState([])
  const [filteredInquiries, setFilteredInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showInquiryDetails, setShowInquiryDetails] = useState(false)

  useEffect(() => {
    if (websiteId) {
      fetchInquiries()
    }
  }, [websiteId])

  useEffect(() => {
    filterInquiries()
  }, [searchTerm, statusFilter, inquiries])

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .rpc('admin_get_contact_submissions', { target_website_id: websiteId })

      if (error) throw error
      setInquiries(data || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInquiries = () => {
    let filtered = inquiries

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredInquiries(filtered)
  }

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const { data, error } = await supabase
        .rpc('admin_update_contact_submission', {
          submission_id: inquiryId,
          new_status: newStatus
        })

      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Failed to update status')

      setInquiries(inquiries.map(inquiry =>
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ))

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error)
      alert('Failed to update inquiry status')
    }
  }

  const deleteInquiry = async (inquiryId) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) {
      return
    }

    try {
      const { data, error } = await supabase
        .rpc('admin_delete_contact_submission', { submission_id: inquiryId })

      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Failed to delete inquiry')

      setInquiries(inquiries.filter(inquiry => inquiry.id !== inquiryId))
      if (selectedInquiry?.id === inquiryId) {
        setShowInquiryDetails(false)
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      alert('Failed to delete inquiry')
    }
  }

  const viewInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowInquiryDetails(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'
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
              <MessageSquare className="w-3 h-3" />
              Communication Center
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Customer <span className="text-gray-400">Inquiries.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">Manage and respond to support requests and feedback.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
              {filteredInquiries.length} Active Tickets
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm mb-10 transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
              <input
                type="text"
                placeholder="Search by customer name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
              />
            </div>
            <div className="lg:col-span-5 relative group">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-16 pr-10 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Inquiries</option>
                <option value="new">New / Unread</option>
                <option value="pending">Pending Review</option>
                <option value="resolved">Resolved Tickets</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[3rem] h-24 animate-pulse border border-gray-50" />
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Inbox is clear</h3>
            <p className="text-gray-400 font-medium">No customer inquiries match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inquiry Subject</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-orange group-hover:text-white transition-all duration-500 shadow-inner uppercase font-black text-xs">
                            {inquiry.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors">{inquiry.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 lowercase tracking-widest mt-0.5">{inquiry.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-700 line-clamp-1 group-hover:text-black transition-colors">{inquiry.subject}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => viewInquiryDetails(inquiry)}
                          className="px-5 py-2.5 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm flex items-center gap-2 ml-auto"
                        >
                          View Inquiry <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showInquiryDetails && selectedInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowInquiryDetails(false)}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
              
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Inquiry Details</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Received {new Date(selectedInquiry.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowInquiryDetails(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-10 mb-12">
                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-brand-orange" /> Ticket Overview
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</p>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-relaxed">{selectedInquiry.subject}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['new', 'pending', 'resolved'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateInquiryStatus(selectedInquiry.id, status)}
                              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                                selectedInquiry.status === status
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-400 border-gray-100 hover:border-brand-orange hover:text-brand-orange'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3 text-brand-orange" /> Contact Profile
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Name</p>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{selectedInquiry.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-xs font-bold text-gray-500 lowercase flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {selectedInquiry.email}
                        </p>
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> {selectedInquiry.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Content</h4>
                  <div className="p-10 rounded-[3rem] bg-[#F9FAFB] border border-gray-100 shadow-inner relative">
                    <p className="text-gray-700 font-medium leading-relaxed italic">
                      "{selectedInquiry.message}"
                    </p>
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50">
                      <span className="text-4xl font-black text-gray-100 font-serif">“</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => deleteInquiry(selectedInquiry.id)}
                  className="px-8 py-5 bg-white text-rose-500 border border-rose-100 font-black rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px] flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Ticket
                </button>
                <button
                  onClick={() => setShowInquiryDetails(false)}
                  className="px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-widest text-xs"
                >
                  Close Inquiry
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
