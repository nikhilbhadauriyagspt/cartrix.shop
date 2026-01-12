import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext({})

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

const getSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id')
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('guest_session_id', sessionId)
  }
  return sessionId
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(getSessionId())

  useEffect(() => {
    if (user) {
      mergeGuestCartAndFetch()
    } else {
      fetchGuestCart()
    }
  }, [user])

  const mergeGuestCartAndFetch = async () => {
    try {
      await supabase.rpc('merge_guest_cart_to_user', {
        p_session_id: sessionId,
        p_user_id: user.id
      })
      await fetchCart()
    } catch (error) {
      console.error('Error merging guest cart:', error)
      await fetchCart()
    }
  }

  const fetchGuestCart = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('session_id', sessionId)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching guest cart:', error)
      loadLocalCart()
    } finally {
      setLoading(false)
    }
  }

  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        setCartItems(JSON.parse(localCart))
      }
    } catch (error) {
      console.error('Error loading local cart:', error)
    }
  }

  const saveLocalCart = (items) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving local cart:', error)
    }
  }

  const fetchCart = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!user) {
        const existingItem = cartItems.find(item => item.product_id === productId)

        if (existingItem) {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
            .eq('id', existingItem.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('cart_items')
            .insert([{ session_id: sessionId, product_id: productId, quantity }])

          if (error) throw error
        }

        await fetchGuestCart()
        return
      }

      const existingItem = cartItems.find(item => item.product_id === productId)

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
          .eq('id', existingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([{ user_id: user.id, product_id: productId, quantity }])

        if (error) throw error
      }

      await fetchCart()
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) throw error

      if (user) {
        await fetchCart()
      } else {
        await fetchGuestCart()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      if (user) {
        await fetchCart()
      } else {
        await fetchGuestCart()
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      if (!user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('session_id', sessionId)

        if (error) throw error
        setCartItems([])
        return
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setCartItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.products.price) * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCart,
    sessionId,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
