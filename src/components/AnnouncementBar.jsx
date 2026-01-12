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
    <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 text-white py-3 px-4 relative shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <p className="text-sm font-bold whitespace-pre-line">
          {announcement}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 p-1.5 rounded-xl transition-all"
          aria-label="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
