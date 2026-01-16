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
  const [isCartOpen, setIsCartOpen] = useState(false)

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

  const fetchGuestCart = async (silent = false) => {
    if (!silent) setLoading(true)
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
      if (!silent) setLoading(false)
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

  const fetchCart = async (silent = false) => {
    if (!user) return

    if (!silent) setLoading(true)
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
      if (!silent) setLoading(false)
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

        await fetchGuestCart(true)
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

      await fetchCart(true)
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

    // Optimistic Update
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) throw error

      // Silent fetch to ensure sync without loader
      if (user) {
        await fetchCart(true)
      } else {
        await fetchGuestCart(true)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      // Revert on error (optional, but good practice)
      if (user) await fetchCart(true)
      else await fetchGuestCart(true)
      throw error
    }
  }

  const removeFromCart = async (itemId) => {
    // Optimistic Remove
    setCartItems(prev => prev.filter(item => item.id !== itemId))

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      if (user) {
        await fetchCart(true)
      } else {
        await fetchGuestCart(true)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      if (user) await fetchCart(true)
      else await fetchGuestCart(true)
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
      // Ensure product exists and price is valid
      if (!item.products || typeof item.products.price !== 'number') return total
      return total + (item.products.price * item.quantity)
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
    isCartOpen,
    setIsCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}