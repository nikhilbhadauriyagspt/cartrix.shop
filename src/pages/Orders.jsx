import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWebsite } from '../contexts/WebsiteContext'
import { supabase } from '../lib/supabase'
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  History,
  MapPin,
  Calendar
} from 'lucide-react'
import { formatImageUrl } from '../utils/formatUrl'

export default function Orders() {
  const { user } = useAuth()
  const { websiteId } = useWebsite()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Orders - Modern Workspace'
    window.scrollTo(0, 0)
    if (user && websiteId) {
      fetchOrders()
    }
  }, [user, websiteId])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.id)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'processing':
        return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100'
      case 'shipped':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'failed':
        return 'bg-rose-50 text-rose-600 border-rose-100'
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-brand-orange"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-40 h-40 bg-[#F9FAFB] rounded-[3rem] flex items-center justify-center mb-10 shadow-xl">
          <History className="w-16 h-16 text-gray-200" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Access Your History.</h2>
        <p className="text-gray-500 font-medium mb-12 max-w-sm">Please sign in to view your previous workspace investments and track active orders.</p>
        <Link to="/login" className="px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-xl uppercase tracking-widest text-xs flex items-center gap-3">
          Sign In to Account <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-orange selection:text-white pb-24">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in shadow-sm">
              <History className="w-3 h-3" />
              Order History
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] animate-slide-up">
              Track Your <br />
              <span className="text-gray-400">Workspace.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="mb-12 flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
            {orders.length} Total Orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-[#F9FAFB] rounded-[4rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Package className="w-10 h-10 text-gray-100" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Orders Found</h2>
            <p className="text-gray-500 font-medium mb-12 max-w-sm mx-auto">It looks like you haven't started your workspace journey with us yet.</p>
            <Link to="/shop" className="px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-brand-orange transition-all duration-300 shadow-xl uppercase tracking-widest text-xs">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {orders.map((order, idx) => (
              <div 
                key={order.id} 
                className="group bg-white rounded-[4rem] border border-gray-100 hover:border-brand-orange/20 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Order Top Bar */}
                <div className="px-8 md:px-12 py-8 bg-[#F9FAFB] group-hover:bg-white transition-colors duration-700 border-b border-gray-50 flex flex-wrap items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Reference</p>
                      <p className="font-black text-gray-900 tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Placed On</p>
                      <p className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total</p>
                      <p className="text-2xl font-black text-brand-orange tracking-tighter">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                    <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="px-8 md:px-12 py-10">
                  <div className="grid lg:grid-cols-12 gap-12">
                    
                    {/* Items List */}
                    <div className="lg:col-span-7 space-y-6">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-brand-orange" /> Included Items
                      </h3>
                      <div className="space-y-4">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-6 p-4 rounded-3xl bg-gray-50 group-hover:bg-white border border-transparent hover:border-gray-100 transition-all duration-500">
                            <div className="w-20 h-20 bg-white rounded-2xl p-3 border border-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={formatImageUrl(item.products?.image_url)}
                                alt={item.products?.name}
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-gray-900 tracking-tight line-clamp-1">{item.products?.name || 'Workspace Tool'}</h4>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">${parseFloat(item.price).toFixed(2)}</span>
                              </div>
                            </div>
                            <p className="font-black text-gray-900 text-sm pr-4">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Meta Details */}
                    <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-8 lg:border-l lg:border-gray-50 lg:pl-12">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-orange" /> Delivery Point
                        </h3>
                        <div className="p-6 rounded-3xl bg-gray-50 group-hover:bg-white border border-transparent transition-all duration-500">
                          <p className="text-sm font-black text-gray-900 mb-1">{order.shipping_address?.fullName}</p>
                          <p className="text-xs font-bold text-gray-500 leading-relaxed">
                            {order.shipping_address?.address}<br />
                            {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                            {order.shipping_address?.zipCode}, {order.shipping_address?.country}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-brand-orange" /> Payment Info
                        </h3>
                        <div className="p-6 rounded-3xl bg-gray-50 group-hover:bg-white border border-transparent transition-all duration-500 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-50 flex items-center justify-center text-gray-400">
                              {order.payment_method?.toLowerCase().includes('cash') ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</p>
                              <p className="text-xs font-black text-gray-900">{order.payment_method || 'Secure Gateway'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getPaymentStatusColor(order.payment_status)} bg-white`}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</p>
                              <p className="text-xs font-black text-gray-900 uppercase">{order.payment_status || 'Pending'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-8 md:px-12 py-6 bg-[#F9FAFB] group-hover:bg-brand-orange/5 transition-colors duration-700 flex items-center justify-end">
                  <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-orange transition-colors">
                    Download Invoice <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  )
}
