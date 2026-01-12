import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AdminAuthContext = createContext({})

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminSession()
  }, [])

  const checkAdminSession = () => {
    try {
      const adminData = localStorage.getItem('admin_session')
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData)
        const expiresAt = new Date(parsedAdmin.expiresAt)

        if (expiresAt > new Date()) {
          setAdmin(parsedAdmin)
        } else {
          localStorage.removeItem('admin_session')
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error)
      localStorage.removeItem('admin_session')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase
        .rpc('verify_admin_password', {
          admin_email: email,
          admin_password: password
        })

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('Invalid email or password')
      }

      const adminData = data[0]

      await supabase.rpc('update_admin_last_login', {
        admin_id: adminData.id
      })

      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 8)

      const adminSession = {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        expiresAt: expiresAt.toISOString()
      }

      localStorage.setItem('admin_session', JSON.stringify(adminSession))
      setAdmin(adminSession)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_session')
    setAdmin(null)
  }

  const updateAdminEmail = async (newEmail) => {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ email: newEmail, updated_at: new Date().toISOString() })
        .eq('id', admin.id)

      if (error) throw error

      const updatedAdmin = { ...admin, email: newEmail }
      localStorage.setItem('admin_session', JSON.stringify(updatedAdmin))
      setAdmin(updatedAdmin)

      return { success: true }
    } catch (error) {
      console.error('Update email error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateAdminPassword = async (newPassword) => {
    try {
      const { data, error } = await supabase
        .rpc('update_admin_password', {
          admin_id: admin.id,
          new_password: newPassword
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    admin,
    loading,
    login,
    logout,
    updateAdminEmail,
    updateAdminPassword,
    isAuthenticated: !!admin
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
