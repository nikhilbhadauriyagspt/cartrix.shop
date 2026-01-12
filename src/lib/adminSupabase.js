import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Admin client with service role for bypassing RLS
export const adminSupabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Check if admin client is available
export const isAdminClientAvailable = () => {
  return adminSupabase !== null
}

// Helper to verify admin session
export const verifyAdminSession = () => {
  try {
    const adminData = localStorage.getItem('admin_session')
    if (!adminData) return null

    const parsedAdmin = JSON.parse(adminData)
    const expiresAt = new Date(parsedAdmin.expiresAt)

    if (expiresAt > new Date()) {
      return parsedAdmin
    } else {
      localStorage.removeItem('admin_session')
      return null
    }
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return null
  }
}
