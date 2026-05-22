import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useProducts } from '../hooks/useProducts'
import { formatCOP } from '../utils/format'
import { StockBadge } from '../components/ui/StockBadge'
import { useAuth } from '../context/AuthContext'
import { categoryConfig } from '../components/product/CategoryIcon'

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const { products } = useProducts()
  const navigate = useNavigate()

  const cartProducts = items.map(item => ({
    item,
    product: products.find(p => p.id === item.productId),
  })).filter(x => x.product !== undefined)

  const total = cartProducts.reduce(
    (sum, { item, product }) => sum + (product?.price ?? 0) * item.quantity,
    0
  )

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={36} className="text-warm-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-espresso mb-2">Tu carrito está vacío</h2>
        <p className="text-warm-600 mb-8">Agrega productos desde el catálogo para continuar.</p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-clay-500 text-white font-semibold rounded-xl hover:bg-clay-600 transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    )
  }

  function handleCheckout() {
    if (!user) {
      navigate('/auth/login?redirect=/pedido')
    } else {
      navigate('/pedido')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-clay-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Compra</p>
        <h1 className="font-display text-3xl font-bold text-espresso">
          Tu carrito · {items.length} {items.length === 1 ? 'producto' : 'productos'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {cartProducts.map(({ item, product }) => {
            if (!product) return null
            const config = categoryConfig[product.category] ?? { bg: 'bg-warm-100', emoji: '📦' }
            return (
              <div key={item.productId} className="bg-warm-50 border border-warm-300 rounded-2xl p-4 flex gap-4 items-start">
                <div className={`${config.bg} rounded-xl p-3 shrink-0 text-2xl`}>
                  {config.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/productos/${product.id}`}
                    className="font-semibold text-espresso hover:text-clay-500 text-sm leading-tight block transition-colors"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StockBadge status={product.status} />
                    <span className="text-xs text-warm-400">{product.material}</span>
                  </div>
                  <p className="text-sm font-semibold text-espresso mt-2">{formatCOP(product.price)} c/u</p>
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-warm-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="flex items-center border border-warm-300 rounded-xl overflow-hidden text-sm bg-warm-100">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-warm-200 text-warm-600 transition-colors"
                    >−</button>
                    <span className="px-3 py-1.5 border-x border-warm-300 font-medium text-espresso">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, Math.min(product.available, item.quantity + 1))}
                      className="px-2.5 py-1.5 hover:bg-warm-200 text-warm-600 transition-colors"
                    >+</button>
                  </div>
                  <p className="font-bold text-espresso text-sm">{formatCOP(product.price * item.quantity)}</p>
                </div>
              </div>
            )
          })}

          <button
            onClick={clearCart}
            className="text-xs text-warm-400 hover:text-red-400 transition-colors pt-1"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6 sticky top-24 space-y-4">
            <h2 className="font-display font-semibold text-espresso text-lg">Resumen</h2>

            <div className="space-y-2 text-sm">
              {cartProducts.map(({ item, product }) => product && (
                <div key={item.productId} className="flex justify-between text-warm-700">
                  <span className="truncate mr-2">{product.name} ×{item.quantity}</span>
                  <span className="shrink-0 font-medium">{formatCOP(product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-warm-200 pt-3 flex justify-between font-bold text-espresso">
              <span>Total</span>
              <span className="font-display">{formatCOP(total)}</span>
            </div>

            <p className="text-xs text-warm-500 leading-relaxed">
              Los productos se fabrican a pedido. El tiempo de producción varía según disponibilidad.
            </p>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-clay-500 text-white font-semibold py-3 rounded-xl hover:bg-clay-600 transition-colors shadow-sm"
            >
              Continuar con el pedido
              <ArrowRight size={16} />
            </button>

            {!user && (
              <p className="text-xs text-center text-warm-500">
                Se requiere iniciar sesión para completar el pedido.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
