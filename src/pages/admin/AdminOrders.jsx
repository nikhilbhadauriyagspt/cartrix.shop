import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { useWebsite } from '../../contexts/WebsiteContext'
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown
} from 'lucide-react'

export default function AdminOrders() {
  const { websiteId } = useWebsite()
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
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5" />,
      processing: <Package className="w-5 h-5" />,
      shipped: <Truck className="w-5 h-5" />,
      delivered: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />,
    }
    return icons[status] || <Clock className="w-5 h-5" />
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
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
          <h2 className="text-3xl font-bold text-slate-900">Order Management</h2>
          <p className="text-slate-600 mt-1">View and manage customer orders</p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID..."
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
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-slate-600">Total Orders:</span>
            <span className="font-bold text-slate-900">{filteredOrders.length}</span>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Orders will appear here once customers make purchases'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 capitalize">
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-2xl hover:bg-sky-700 transition-colors text-sm font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Order Details
                  </h3>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600">Order ID</label>
                      <p className="font-mono text-slate-900 mt-1">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Order Date</label>
                      <p className="text-slate-900 mt-1">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Total Amount</label>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 block mb-2">
                        Order Status
                      </label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Payment Status</label>
                      <p className="text-slate-900 mt-1 capitalize">{selectedOrder.payment_status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600">Payment Method</label>
                      <p className="text-slate-900 mt-1 capitalize">
                        {selectedOrder.payment_method || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Customer Information</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {selectedOrder.is_guest ? (
                      <>
                        <div>
                          <span className="text-sm font-bold text-slate-600">Name: </span>
                          <span className="text-slate-900">{selectedOrder.guest_name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-600">Email: </span>
                          <span className="text-slate-900">{selectedOrder.guest_email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-600">Phone: </span>
                          <span className="text-slate-900">{selectedOrder.guest_phone || 'N/A'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-sm font-bold text-slate-600">Name: </span>
                          <span className="text-slate-900">{selectedOrder.shipping_address?.fullName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-600">Email: </span>
                          <span className="text-slate-900">{selectedOrder.shipping_address?.email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-600">Phone: </span>
                          <span className="text-slate-900">{selectedOrder.shipping_address?.phone || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {selectedOrder.shipping_address && Object.keys(selectedOrder.shipping_address).length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Shipping Address</h4>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-slate-900">{selectedOrder.shipping_address.address || 'N/A'}</p>
                      <p className="text-slate-600 mt-1">
                        {selectedOrder.shipping_address.city || 'N/A'}, {selectedOrder.shipping_address.state || 'N/A'} {selectedOrder.shipping_address.zipCode || ''}
                      </p>
                      <p className="text-slate-600">
                        {selectedOrder.shipping_address.country || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        {item.products?.image_url && (
                          <img
                            src={item.products.image_url}
                            alt={item.products?.name}
                            className="w-16 h-16 object-cover rounded-2xl"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{item.products?.name || 'Product'}</p>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
