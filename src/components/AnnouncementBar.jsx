import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useWebsite } from '../contexts/WebsiteContext'

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const { websiteId } = useWebsite()

  useEffect(() => {
    fetchAnnouncement()
  }, [websiteId])

  const fetchAnnouncement = async () => {
    try {
      if (!websiteId) return

      const { data, error } = await supabase
        .from('site_settings')
        .select('announcement_text, announcement_enabled')
        .eq('website_id', websiteId)
        .maybeSingle()

      if (error) throw error

      if (data && data.announcement_enabled && data.announcement_text) {
        setAnnouncement(data.announcement_text)
      }
    } catch (error) {
      console.error('Error fetching announcement:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !isVisible || !announcement) return null

  return (
    <div className="bg-brand-orange text-white py-2.5 relative z-50 animate-in fade-in slide-in-from-top-1 duration-500">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
        <p className="text-xs font-bold tracking-widest uppercase">
          {announcement}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}