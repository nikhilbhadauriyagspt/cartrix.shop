import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useWebsite } from './WebsiteContext'

const SiteSettingsContext = createContext()

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    brand_name: 'Printer Pro',
    brand_logo: '',
    contact_email: 'info@printerpro.com',
    contact_phone: '+1-234-567-8900',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsite()

  useEffect(() => {
    if (websiteId) {
      fetchSettings()
    }
  }, [websiteId])

  const fetchSettings = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )

      const fetchPromise = supabase
        .from('site_settings')
        .select('*')
        .eq('website_id', websiteId)
        .maybeSingle()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) throw error

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = () => {
    fetchSettings()
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return context
}
