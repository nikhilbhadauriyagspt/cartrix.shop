import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useWebsite } from '../contexts/WebsiteContext'

import {
    Printer,
    Droplet,
    Settings,
    Zap,
    Shield,
    Package,
    ChevronRight
} from 'lucide-react'

/* Icon mapping based on category name */
const ICON_MAP = {
    laser: Printer,
    ink: Droplet,
    multi: Settings,
    fast: Zap,
    business: Shield,
    consumable: Package,
}

export default function CategorySection() {
    const { websiteId } = useWebsite()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from('categories')
            .select(`
        id,
        name,
        description,
        products (id)
      `)
            .order('name')
            .limit(10)

        if (!error) {
            setCategories(
                data.map(cat => ({
                    ...cat,
                    count: cat.products?.length || 0
                }))
                    .filter(cat => cat.count > 0)
            )
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <section className="py-20 bg-gray-50 text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
            </section>
        )
    }

    return (
        <section className="py-10  bg-gray-50 ">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 ">

                {/* Heading */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 ">
                        Find Your Perfect Product
                    </h2>
                    <p className="mt-4 text-gray-600  max-w-2xl mx-auto">
                        Explore categories tailored to every need
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-5">
                    {categories.map(category => {
                        const key = category.name.toLowerCase()
                        const Icon =
                            Object.keys(ICON_MAP).find(k => key.includes(k))
                                ? ICON_MAP[Object.keys(ICON_MAP).find(k => key.includes(k))]
                                : Package

                        return (
                            <Link
                                key={category.id}
                                to={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="
                  group rounded-xl border border-gray-200 
                  bg-white  p-5 text-center
                  transition-all duration-200
                  hover:shadow-lg hover:-translate-y-1
                "
                            >
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border bg-gray-50 ">
                                    <Icon size={26} className="text-gray-700 " />
                                </div>

                                <h3 className="text-sm font-semibold text-gray-900 ">
                                    {category.name}
                                </h3>

                                <p className="mt-1 text-xs text-gray-500  line-clamp-2">
                                    {category.description || 'Explore products'}
                                </p>

                                <span className="mt-3 inline-block rounded-full bg-gray-100  px-4 py-1 text-xs text-gray-600 ">
                                    {category.count} products
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {categories.length === 10 && ( // Only show "Explore All" if there are potentially more categories
                    <div className="text-center mt-12">
                        <Link
                            to="/categories" // Link to the new "All Categories" page
                            className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary-600 text-primary-700 font-semibold rounded-full shadow-md hover:bg-primary-50 transition-all duration-300 transform hover:scale-105"
                        >
                            Explore All Categories <ChevronRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
