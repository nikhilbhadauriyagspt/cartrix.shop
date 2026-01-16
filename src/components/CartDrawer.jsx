import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import { formatImageUrl } from '../utils/formatUrl'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    loading, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart()
  
  const drawerRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false)
    }
    if (isCartOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen, setIsCartOpen])

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  const handleProductClick = (productId) => {
    setIsCartOpen(false)
    navigate(`/shop/${productId}`)
  }

  if (!isCartOpen) return null

  const subtotal = getCartTotal()
  // Assuming free shipping for now or calculated at checkout
  const total = subtotal 

  return (
    <div className="relative z-[100]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 sm:rounded-l-2xl border-l border-gray-100"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sm:rounded-tl-2xl">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-brand-orange" />
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
              Your Cart 
              <span className="ml-2 text-gray-400 font-medium text-lg">({cartItems.length})</span>
            </h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
               <p className="text-gray-400 font-medium text-sm">Loading your cart...</p>
             </div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</p>
                <p className="text-gray-500 text-sm max-w-[200px] mx-auto">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false)
                  navigate('/shop')
                }}
                className="px-8 py-3 bg-black text-white font-bold uppercase text-sm tracking-wide rounded hover:bg-brand-orange transition-all shadow-lg hover:shadow-brand-orange/30"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* Image */}
                  <div 
                    className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl p-2 cursor-pointer overflow-hidden border border-gray-100 group-hover:border-brand-orange/30 transition-colors"
                    onClick={() => handleProductClick(item.products.id)}
                  >
                    <img
                      src={formatImageUrl(item.products.image_url)}
                      alt={item.products.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        onClick={() => handleProductClick(item.products.id)}
                        className="font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-brand-orange transition-colors text-sm mb-1"
                      >
                        {item.products.name}
                      </h3>
                      <p className="text-brand-orange font-bold text-lg">
                        ${parseFloat(item.products.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty */}
                      <div className="flex items-center border border-gray-200 rounded-lg h-8 w-24 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="flex-1 text-center font-bold text-xs text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50 sm:rounded-bl-2xl">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Shipping</span>
                <span className="text-green-600 font-bold text-xs uppercase bg-green-100 px-2 py-0.5 rounded">Free</span>
              </div>
              <div className="flex justify-between items-center text-xl pt-3 border-t border-gray-200">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-brand-orange">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gray-900 text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-orange transition-all shadow-lg hover:shadow-brand-orange/30 flex items-center justify-center gap-3 group"
            >
              Checkout Now 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium">
              Secure Checkout powered by Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}