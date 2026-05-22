import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Search, X } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { StockBadge } from '../../components/ui/StockBadge'
import { formatCOP } from '../../utils/format'
import { Spinner } from '../../components/ui/Spinner'

const CATEGORIES = [
  'Accesibilidad Visual',
  'Material Didactico',
  'Comunicacion Aumentativa',
  'Accesibilidad Motriz',
  'Figuras Didacticas',
  'Accesorios de Accesibilidad',
]
const MATERIALS = ['PLA', 'PLA+', 'PETG', 'TPU', 'ABS', 'Resina']
const STATUSES = ['Disponible', 'Stock Bajo', 'Sin Stock']

const sel = 'border border-warm-300 rounded-xl px-3 py-2 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 text-warm-700'

export function AdminProducts() {
  const { products, loading } = useProducts()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [material, setMaterial] = useState('')
  const [status, setStatus] = useState('')

  const filtered = useMemo(() => {
    let list = products
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    if (category) list = list.filter(p => p.category === category)
    if (material) list = list.filter(p => p.material === material)
    if (status) list = list.filter(p => p.status === status)
    return list
  }, [products, search, category, material, status])

  const hasFilters = search || category || material || status

  function clearAll() {
    setSearch('')
    setCategory('')
    setMaterial('')
    setStatus('')
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Productos</h1>
          <p className="text-warm-600 text-sm mt-0.5">
            {filtered.length < products.length
              ? `${filtered.length} de ${products.length} recursos`
              : `${products.length} recursos en el catálogo`}
          </p>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-clay-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-clay-600 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-8 pr-8 py-2 text-sm border border-warm-300 rounded-xl bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400 w-56"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
              <X size={13} />
            </button>
          )}
        </div>

        <select value={category} onChange={e => setCategory(e.target.value)} className={sel}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={material} onChange={e => setMaterial(e.target.value)} className={sel}>
          <option value="">Todos los materiales</option>
          {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)} className={sel}>
          <option value="">Todos los estados</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-warm-500 hover:text-clay-500 transition-colors">
            <X size={11} /> Limpiar
          </button>
        )}
      </div>

      <div className="bg-warm-50 border border-warm-300 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-160">
          <thead className="bg-warm-100 border-b border-warm-300">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Material</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Precio</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-warm-400 text-sm">
                  No hay productos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-warm-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-espresso max-w-52 truncate">{p.name}</td>
                  <td className="px-4 py-3 text-warm-600 text-xs">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className="bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md text-xs font-medium">{p.material}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-espresso text-xs">{formatCOP(p.price)}</td>
                  <td className="px-4 py-3">
                    <StockBadge status={p.status} available={p.available} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/productos/${p.id}`}
                      className="flex items-center gap-1 text-xs text-clay-500 hover:text-clay-700 font-medium transition-colors"
                    >
                      <Pencil size={12} />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
