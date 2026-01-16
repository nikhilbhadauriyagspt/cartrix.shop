import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { Search, User, Mail, Calendar, Eye, XCircle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'

export default function AdminUsers() {
  const { websiteId, currentWebsite } = useWebsite()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [showUserDetails, setShowUserDetails] = useState(false)

  useEffect(() => {
    if (websiteId) {
      setLoading(true)
      fetchUsers()
    }
  }, [websiteId])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const fetchUsers = async () => {
    if (!websiteId || websiteId === 'undefined') return;
    
    try {
      const { data, error } = await supabase.rpc('admin_get_users_by_website', {
        target_website_id: websiteId
      })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const viewUserDetails = async (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)

    try {
      const { data, error } = await supabase.rpc('admin_get_user_orders', {
        target_user_id: user.id
      })

      if (error) throw error
      setUserOrders(data || [])
    } catch (error) {
      console.error('Error fetching user orders:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      processing: 'bg-blue-50 text-blue-600 border-blue-100',
      shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    }
    return colors[status] || 'bg-slate-50 text-slate-600'
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Customer Records
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Manage <span className="text-gray-400">Users.</span>
            </h2>
            <p className="text-gray-500 font-medium mt-2">
              Showing users for <span className="text-brand-orange font-bold">{currentWebsite?.name || 'Current Website'}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
              {filteredUsers.length} Users Found
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm mb-10 transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search by email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm animate-pulse h-96" />
        ) : filteredUsers.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-400 font-medium">
              {searchTerm ? 'Try a different search term.' : `No users have registered on ${currentWebsite?.name} yet.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-brand-orange group-hover:text-white flex items-center justify-center text-gray-400 font-black text-xs transition-all duration-500 shadow-inner">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-orange transition-colors">
                            {user.email.split('@')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-300" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="px-5 py-2.5 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm"
                        >
                          View Activity
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowUserDetails(false)}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
              
              <div className="p-10 md:p-14 overflow-y-auto">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#F9FAFB] rounded-[2rem] flex items-center justify-center text-brand-orange text-3xl font-black shadow-inner">
                      {selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedUser.email.split('@')[0]}</h3>
                      <p className="text-gray-500 font-medium italic">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-10 mb-12">
                  <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">System Identifier</p>
                    <p className="font-mono text-xs text-gray-900 break-all">{selectedUser.id}</p>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Registration Date</p>
                    <p className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-brand-orange" />
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                    Order History <span className="text-gray-300 font-normal">({userOrders.length})</span>
                  </h4>
                  {userOrders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">This user hasn't placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex-1">
                            <p className="font-black text-gray-900 tracking-tight">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-brand-orange">
                              ${parseFloat(order.total_amount).toFixed(2)}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
