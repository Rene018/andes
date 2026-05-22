import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

const TABS = [
  { label: 'Mis pedidos', to: '/cuenta/pedidos' },
  { label: 'Mi perfil', to: '/cuenta/perfil' },
]
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrderContext'
import { formatCOP } from '../../utils/format'

const STATUS_COLORS = {
  'Recibida': 'bg-warm-200 text-warm-700',
  'En Produccion': 'bg-clay-100 text-clay-700',
  'Revision de Calidad': 'bg-gold-400/20 text-gold-600',
  'Empaque y Transporte': 'bg-sage-50 text-sage-600',
  'Entregada': 'bg-sage-100 text-sage-700',
}

export function MyOrdersPage() {
  const { user, profile } = useAuth()
  const { orders } = useOrders()

  const myOrders = orders.filter(o => o.userId === user?.id || o.email === user?.email)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <p className="text-clay-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Mi cuenta</p>
        <h1 className="font-display text-3xl font-bold text-espresso">Mis pedidos</h1>
        <p className="text-warm-500 text-sm mt-1">{profile?.fullName ?? user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-warm-200">
        {TABS.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              tab.to === '/cuenta/pedidos'
                ? 'text-clay-600 border-b-2 border-clay-500 -mb-px bg-white'
                : 'text-warm-500 hover:text-espresso'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={36} className="text-warm-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-espresso mb-2">Sin pedidos aún</h2>
          <p className="text-warm-500 mb-8 text-sm">Cuando realices un pedido aparecerá aquí.</p>
          <Link
            to="/productos"
            className="inline-flex px-6 py-3 bg-clay-500 text-white font-semibold rounded-xl hover:bg-clay-600 transition-colors"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => (
            <div key={order.id} className="bg-warm-50 border border-warm-300 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <p className="font-semibold text-espresso text-sm font-mono">{order.id}</p>
                  <p className="text-xs text-warm-400 mt-0.5">{order.createdAt}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-warm-200 text-warm-600'}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                {order.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-warm-700">{item.productName} ×{item.quantity}</span>
                    <span className="text-warm-600">{formatCOP(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-200 pt-3 flex justify-between font-bold text-espresso text-sm">
                <span>Total</span>
                <span className="font-display">{formatCOP(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
