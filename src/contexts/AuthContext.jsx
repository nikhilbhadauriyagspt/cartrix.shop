import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        )

        const sessionPromise = supabase.auth.getSession()

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Handle pending website registration for Social Login
        if (currentUser) {
          const pendingWebsiteId = localStorage.getItem('pending_website_registration')
          if (pendingWebsiteId) {
            try {
              await supabase
                .from('user_website_registrations')
                .upsert([{
                  user_id: currentUser.id,
                  website_id: pendingWebsiteId
                }], { onConflict: 'user_id,website_id' })
              localStorage.removeItem('pending_website_registration')
            } catch (err) {
              console.error('Error handling social login registration:', err)
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Also check on auth state change (for some browser flows)
      if (currentUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const pendingWebsiteId = localStorage.getItem('pending_website_registration')
        if (pendingWebsiteId) {
          try {
            await supabase
              .from('user_website_registrations')
              .upsert([{
                user_id: currentUser.id,
                website_id: pendingWebsiteId
              }], { onConflict: 'user_id,website_id' })
            localStorage.removeItem('pending_website_registration')
          } catch (err) {
            console.error('Error handling social login registration change:', err)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata = {}, websiteId = null) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error

    if (data.user && websiteId) {
      try {
        await supabase
          .from('user_website_registrations')
          .insert([{
            user_id: data.user.id,
            website_id: websiteId
          }])
      } catch (regError) {
        // Re-throw the error so it can be caught by the UI
        console.error('Error tracking user registration:', regError)
        throw new Error(`User created, but failed to associate with website. DB Error: ${regError.message}`);
      }
    }

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async (websiteId = null) => {
    if (websiteId) {
      localStorage.setItem('pending_website_registration', websiteId)
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
