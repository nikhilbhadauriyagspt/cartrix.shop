import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useWebsite } from './WebsiteContext'

const WishlistContext = createContext({})

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const { websiteId } = useWebsite()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. Initial Load & Sync
  useEffect(() => {
    if (user) {
      syncAndFetchWishlist()
    } else {
      loadLocalWishlist()
    }
  }, [user, websiteId])

  // 2. Fetch from DB
  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .eq('website_id', websiteId)

      if (error) throw error
      setWishlistItems(data || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  // 3. Load from LocalStorage (for Guests)
  const loadLocalWishlist = async () => {
    const localData = localStorage.getItem('guest_wishlist')
    if (localData) {
      const productIds = JSON.parse(localData)
      if (productIds.length > 0) {
        setLoading(true)
        try {
          // Fetch product details for the stored IDs
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
          
          if (error) throw error
          // Format to match DB structure
          const formatted = data.map(p => ({ product_id: p.id, products: p }))
          setWishlistItems(formatted)
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      } else {
        setWishlistItems([])
      }
    } else {
      setWishlistItems([])
    }
  }

  // 4. Merge Local to DB on Login
  const syncAndFetchWishlist = async () => {
    const localData = localStorage.getItem('guest_wishlist')
    if (localData && user) {
      const productIds = JSON.parse(localData)
      for (const pId of productIds) {
        await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, product_id: pId, website_id: websiteId }])
          .select()
      }
      localStorage.removeItem('guest_wishlist')
    }
    await fetchWishlist()
  }

  // 5. Add Item
  const addToWishlist = async (productId) => {
    if (!user) {
      // Handle Guest Add
      const localData = localStorage.getItem('guest_wishlist')
      const productIds = localData ? JSON.parse(localData) : []
      if (!productIds.includes(productId)) {
        const newIds = [...productIds, productId]
        localStorage.setItem('guest_wishlist', JSON.stringify(newIds))
        await loadLocalWishlist()
      }
      return
    }

    // Handle Auth User Add
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert([{ user_id: user.id, product_id: productId, website_id: websiteId }])

      if (error) {
        if (error.code === '23505') return; // Already exists
        throw error
      }
      await fetchWishlist()
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  // 6. Remove Item
  const removeFromWishlist = async (productId) => {
    if (!user) {
      const localData = localStorage.getItem('guest_wishlist')
      if (localData) {
        const productIds = JSON.parse(localData)
        const newIds = productIds.filter(id => id !== productId)
        localStorage.setItem('guest_wishlist', JSON.stringify(newIds))
        await loadLocalWishlist()
      }
      return
    }

    try {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
      await fetchWishlist()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId)
  }

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}