import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

export default function AllCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        document.title = 'All Categories - Modern E-commerce Store'
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

        if (!error) {
            setCategories(
                data.map(cat => ({
                    ...cat,
                    count: cat.products?.length || 0
                }))
            )
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
            </div>
        )
    }

    return (
        <div className="bg-white  min-h-screen">
            <section className="py-12 md:py-16 bg-gray-100 ">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900  mb-4">
                        Explore All Product Categories
                    </h1>
                    <p className="text-lg text-gray-600  max-w-2xl mx-auto">
                        Dive into our extensive range of products, organized to help you find exactly what you need.
                    </p>
                </div>
            </section>

            <section className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
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

                    {categories.length === 0 && !loading && (
                        <p className="text-center text-gray-500 mt-8">No categories found.</p>
                    )}
                </div>
            </section>
        </div>
    )
}
