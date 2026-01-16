import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import { formatImageUrl } from '../../utils/formatUrl'
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Calendar,
  CreditCard,
  MapPin,
  User,
  ShoppingBag
} from 'lucide-react'

export default function AdminOrders() {
  const { websiteId, currentWebsite } = useWebsite()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => {
    if (websiteId) {
      setLoading(true)
      fetchOrders()
    }
  }, [websiteId])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.guest_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const viewOrderDetails = async (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            name,
            image_url,
            price
          )
        `)
        .eq('order_id', order.id)

      if (error) throw error
      setOrderItems(data || [])
    } catch (error) {
      console.error('Error fetching order items:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100'
      default: return 'bg-amber-50 text-amber-600 border-amber-100'
    }
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in font-sans selection:bg-brand-orange selection:text-white pb-20">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
                <ShoppingBag className="w-3 h-3" />
                Order Fulfillment
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                Customer <span className="text-gray-400">Orders.</span>
              </h2>
              <p className="text-gray-500 font-medium mt-2">
                Showing transactions for <span className="text-brand-orange font-bold">{currentWebsite?.name}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
                {filteredOrders.length} Total Orders
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm mb-10 transition-all hover:shadow-xl hover:shadow-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
              <input
                type="text"
                placeholder="Search by ID or customer name..."
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
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-[3rem] h-24 animate-pulse border border-gray-50" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200 py-32 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-400 font-medium">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Ref</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Amount</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-[#F9FAFB] transition-colors duration-300">
                      <td className="px-8 py-5">
                        <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-black text-[10px] shadow-inner uppercase">
                            {(order.guest_name || order.shipping_address?.fullName || '?').charAt(0)}
                          </div>
                          <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                            {order.guest_name || order.shipping_address?.fullName || 'Guest User'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-sm font-black text-gray-900 tracking-tighter">${parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="px-5 py-2.5 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm flex items-center gap-2 ml-auto"
                        >
                          Details <ArrowRight className="w-3 h-3" />
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
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowOrderDetails(false)}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
              
              <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowOrderDetails(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid md:grid-cols-3 gap-10 mb-12">
                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3 text-brand-orange" /> Action Center
                    </h4>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Modify Status</label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 outline-none transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="pt-4 border-t border-gray-200/50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Financial Total</p>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">${parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3 text-brand-orange" /> Customer Info
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{selectedOrder.guest_name || selectedOrder.shipping_address?.fullName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-xs font-bold text-gray-500 lowercase">{selectedOrder.guest_email || selectedOrder.shipping_address?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</p>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-1">
                          <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">{selectedOrder.payment_method || 'Secure Gateway'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-brand-orange" /> Shipping Point
                    </h4>
                    <div className="space-y-2">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight leading-relaxed">
                        {selectedOrder.shipping_address?.address || 'Pickup Required'}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                        {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}<br />
                        {selectedOrder.shipping_address?.zipCode}, {selectedOrder.shipping_address?.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                    Items Collection <span className="text-gray-300 font-normal">({orderItems.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] hover:bg-[#F9FAFB] border border-transparent transition-all">
                        <div className="w-20 h-20 bg-white rounded-2xl p-3 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src={formatImageUrl(item.products?.image_url)}
                            alt={item.products?.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">{item.products?.name || 'Workspace Tool'}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                            <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">${parseFloat(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-lg font-black text-gray-900 tracking-tighter">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-500 shadow-xl uppercase tracking-widest text-xs"
                >
                  Done Reviewing
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
