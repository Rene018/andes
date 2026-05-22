import { Link } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import { formatCOP } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { StarRating } from '../ui/StarRating'
import { StockBadge } from '../ui/StockBadge'
import { CategoryIcon, categoryConfig } from './CategoryIcon'
import { useProductImage } from '../../hooks/useProductImage'

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isAdmin } = useAuth()
  const config = categoryConfig[product.category] ?? { bg: 'bg-zinc-100', text: 'text-zinc-600', emoji: '📦' }
  const imageUrl = useProductImage(product.stlFilename)

  return (
    <div className="group bg-white rounded-2xl border border-warm-200 overflow-hidden hover:border-clay-300 hover:shadow-xl hover:shadow-clay-500/8 hover:-translate-y-1 transition-all duration-200 flex flex-col">

      {/* ── Área de imagen ── */}
      <Link
        to={`/productos/${product.id}`}
        className="relative flex justify-center items-center py-8 px-6 bg-warm-50 group-hover:bg-clay-50 transition-colors duration-200 overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="relative z-10 w-36 h-36 object-contain drop-shadow-sm"
          />
        ) : (
          <>
            <div className="absolute w-32 h-32 rounded-full bg-white/60 group-hover:bg-clay-100/40 transition-colors duration-200" />
            <CategoryIcon category={product.category} size={80} className="relative z-10" />
          </>
        )}

        {/* Badge de material — esquina superior derecha */}
        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest text-warm-500 bg-white border border-warm-200 rounded px-1.5 py-0.5 group-hover:border-clay-200 group-hover:text-clay-600 transition-colors">
          {product.material}
        </span>
      </Link>

      {/* ── Contenido ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Categoría */}
        <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 ${config.bg} ${config.text}`}>
          {product.category}
        </span>

        {/* Nombre */}
        <Link to={`/productos/${product.id}`}>
          <h3 className="font-display font-bold text-espresso text-sm leading-snug hover:text-clay-500 transition-colors line-clamp-2 mb-2.5">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <StarRating rating={product.avgRating} count={product.reviewCount} />

        {/* Stock */}
        <div className="mt-2">
          <StockBadge status={product.status} available={product.available} />
        </div>

        {/* Precio + CTA */}
        <div className="mt-auto pt-3.5 flex items-end justify-between gap-2 border-t border-warm-100">
          <div>
            <p className="font-display font-extrabold text-espresso text-base leading-none">
              {formatCOP(product.price)}
            </p>
            <p className="text-[10px] text-warm-400 mt-0.5">por unidad · COP</p>
          </div>

          {!isAdmin && (
            product.available > 0 ? (
              <button
                onClick={() => addItem(product.id)}
                className="flex items-center gap-1 px-3.5 py-2 bg-clay-500 text-white text-xs font-bold rounded-xl hover:bg-clay-600 active:scale-95 transition-all shrink-0"
              >
                <Plus size={13} strokeWidth={2.5} />
                Agregar
              </button>
            ) : (
              <span className="text-[10px] font-semibold text-warm-400 bg-warm-100 px-2.5 py-1.5 rounded-xl shrink-0">
                Sin stock
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}
