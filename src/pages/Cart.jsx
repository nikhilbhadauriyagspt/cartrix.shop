import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Trash2, Plus, Minus, Truck,ShoppingBag } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart()

  useEffect(() => {
    document.title = 'Shopping Cart'
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading your cart...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const shipping = subtotal >= 500 ? 0 : 49.99
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  <Link to={`/shop/${item.products.id}`} className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={item.products.image_url || '/placeholder-printer.jpg'}
                        alt={item.products.name}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  </Link>

                  <div className="flex-1">
                    <Link to={`/shop/${item.products.id}`}>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition">
                        {item.products.name}
                      </h3>
                    </Link>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-semibold text-gray-900">
                          ${parseFloat(item.products.price).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-sm text-gray-500 ml-3">
                            × {item.quantity} = ${(item.products.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-3 hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-3 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-3 text-gray-400 hover:text-red-600 bg-red-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>

              {/* Free Shipping Progress */}
              {subtotal < 500 && (
                <div className="mb-6 p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-700 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Free Shipping
                    </span>
                    <span className="text-sm text-gray-600">
                      Add ${(500 - subtotal).toFixed(2)} more
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${(subtotal / 500) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-2xl font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}