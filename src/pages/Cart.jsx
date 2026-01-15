import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Trash2, Plus, Minus, Truck, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart()

  useEffect(() => {
    document.title = 'Shopping Cart - Premium Printers'
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-brand-orange"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="text-center max-w-lg relative z-10">
          <div className="w-32 h-32 bg-gray-50 rounded-full mx-auto mb-8 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-10 font-medium">
            It looks like you haven't added any items yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-brand-orange transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const shipping = 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Header - Simpler */}
      <div className="py-16 border-b border-gray-50">
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Your Cart <span className="text-gray-400 font-normal text-2xl ml-2">({cartItems.length})</span>
          </h1>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items List - More Compact */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col md:flex-row items-center gap-6 p-4 rounded-[2rem] bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300"
              >
                <Link to={`/shop/${item.products.id}`} className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gray-50 rounded-3xl p-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.products.image_url || '/placeholder-printer.jpg'}
                      alt={item.products.name}
                      className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>

                <div className="flex-1 w-full text-center md:text-left">
                  <div className="mb-3">
                    <Link to={`/shop/${item.products.id}`} className="block">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-brand-orange transition-colors line-clamp-1">
                        {item.products.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">Unit: ${parseFloat(item.products.price).toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Quantity Control - Slimmer */}
                    <div className="flex items-center border border-gray-200 rounded-full h-10 w-28 bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-l-full transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-r-full transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-xl font-bold text-gray-900">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar - Cleaner */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 sticky top-32 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    Free
                  </span>
                </div>
                
                <div className="h-px bg-gray-100 my-4"></div>
                
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-black text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-brand-orange transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Secure Payment
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}