import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecentlyViewed } from '../utils/recentlyViewed'
import { formatImageUrl } from '../utils/formatUrl'
import { History, ArrowRight } from 'lucide-react'

export default function RecentlyViewed() {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(getRecentlyViewed())
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-24 border-t border-gray-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-orange">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recently Viewed</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Based on your browsing history</p>
            </div>
          </div>
          <Link to="/shop" className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {items.slice(0, 5).map((product) => (
            <Link 
              key={product.id} 
              to={`/shop/${product.id}`}
              className="group flex flex-col space-y-4"
            >
              <div className="aspect-square bg-[#F9FAFB] rounded-[2rem] p-6 relative flex items-center justify-center border border-transparent group-hover:border-brand-orange/10 group-hover:bg-white group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <img
                  src={formatImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="px-2">
                <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest mb-1">{product.category_name}</p>
                <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-brand-orange transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-900 font-black text-base mt-1">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
