import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { StockBadge } from '../../components/ui/StockBadge'
import { formatCOP } from '../../utils/format'
import { Spinner } from '../../components/ui/Spinner'

export function AdminProducts() {
  const { products, loading } = useProducts()

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Productos</h1>
          <p className="text-warm-600 text-sm mt-0.5">{products.length} recursos en el catálogo</p>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-clay-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-clay-600 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
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
            {products.map(p => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
