import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/product/ProductCard'
import { ProductFilter } from '../components/product/ProductFilter'
import { Spinner } from '../components/ui/Spinner'

const defaultFilters = {
  categories: [],
  materials: [],
  onlyAvailable: false,
  priceMin: 0,
  priceMax: 100000,
  sortBy: 'name',
}

export function CatalogPage() {
  const { products, loading } = useProducts()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => {
    const cat = searchParams.get('categoria')
    const sort = searchParams.get('sort')
    return {
      ...defaultFilters,
      categories: cat ? [cat] : [],
      sortBy: sort ?? 'name',
    }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('categoria')
    const sort = searchParams.get('sort')
    setFilters(prev => ({
      ...prev,
      categories: cat ? [cat] : prev.categories,
      sortBy: sort ?? prev.sortBy,
    }))
  }, [searchParams])

  const filtered = useMemo(() => {
    let list = [...products]
    if (filters.categories.length > 0) list = list.filter(p => filters.categories.includes(p.category))
    if (filters.materials.length > 0) list = list.filter(p => filters.materials.includes(p.material))
    if (filters.onlyAvailable) list = list.filter(p => p.available > 0)
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc': return a.price - b.price
        case 'price_desc': return b.price - a.price
        case 'rating': return (b.avgRating ?? 0) - (a.avgRating ?? 0)
        default: return a.name.localeCompare(b.name)
      }
    })
    return list
  }, [filters, products])

  const activeFilterCount =
    filters.categories.length +
    filters.materials.length +
    (filters.onlyAvailable ? 1 : 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-clay-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Tienda</p>
          <h1 className="font-display text-3xl font-bold text-espresso">Catálogo de productos</h1>
          <p className="text-warm-600 text-sm mt-1">
            {filtered.length < products.length
              ? `${filtered.length} de ${products.length} productos`
              : `${products.length} productos`}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 border border-warm-300 rounded-xl text-sm text-warm-700 hover:bg-warm-200 transition-colors bg-warm-50"
        >
          <SlidersHorizontal size={15} />
          Filtros
          {activeFilterCount > 0 && (
            <span className="bg-clay-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <ProductFilter filters={filters} onChange={setFilters} />
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-warm-50 p-6 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-semibold text-espresso text-lg">Filtros</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-warm-200 text-warm-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <ProductFilter filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-xl text-warm-600 mb-2">Sin resultados</p>
              <p className="text-warm-500 text-sm mb-4">Intenta ajustar los filtros.</p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="text-clay-500 text-sm hover:text-clay-600 font-medium transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
