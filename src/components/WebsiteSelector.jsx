import { useWebsite } from '../contexts/WebsiteContext'
import { Globe } from 'lucide-react'

export default function WebsiteSelector() {
  const { currentWebsite, websites, switchWebsite } = useWebsite()

  if (websites.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
      <Globe className="w-5 h-5 text-gray-500" />
      <select
        value={currentWebsite?.id || ''}
        onChange={(e) => switchWebsite(e.target.value)}
        className="border-0 bg-transparent focus:ring-0 focus:outline-none text-sm font-medium text-gray-700 cursor-pointer"
      >
        {websites.map((website) => (
          <option key={website.id} value={website.id}>
            {website.name}
          </option>
        ))}
      </select>
    </div>
  )
}
