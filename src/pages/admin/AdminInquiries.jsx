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
  ChevronDown
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
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Customer Inquiries</h2>
          <p className="text-slate-600 mt-1">Manage customer contact submissions</p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-slate-600">Total Inquiries:</span>
            <span className="font-bold text-slate-900">{filteredInquiries.length}</span>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No inquiries found</h3>
            <p className="text-slate-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Customer inquiries will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{inquiry.name}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <Mail className="w-3 h-3" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Phone className="w-3 h-3" />
                              {inquiry.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900 line-clamp-2">{inquiry.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewInquiryDetails(inquiry)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-2xl transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInquiry(inquiry.id)}
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

        {showInquiryDetails && selectedInquiry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">Inquiry Details</h3>
                  <button
                    onClick={() => setShowInquiryDetails(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600">Name</label>
                      <p className="text-slate-900 mt-1 font-bold">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Date</label>
                      <p className="text-slate-900 mt-1">
                        {new Date(selectedInquiry.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Email</label>
                      <p className="text-slate-900 mt-1">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Phone</label>
                      <p className="text-slate-900 mt-1">{selectedInquiry.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">Subject</label>
                  <p className="text-slate-900 font-bold">{selectedInquiry.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">Message</label>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">Status</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, 'new')}
                      className={`px-4 py-2 rounded-2xl font-bold transition-colors ${
                        selectedInquiry.status === 'new'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, 'pending')}
                      className={`px-4 py-2 rounded-2xl font-bold transition-colors ${
                        selectedInquiry.status === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, 'resolved')}
                      className={`px-4 py-2 rounded-2xl font-bold transition-colors ${
                        selectedInquiry.status === 'resolved'
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => deleteInquiry(selectedInquiry.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
