import { Link } from 'react-router-dom'
import { Package, ShoppingBag, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useMaterials } from '../../hooks/useMaterials'
import { useOrders } from '../../context/OrderContext'
import { Spinner } from '../../components/ui/Spinner'

const STATUS_PIPELINE = [
  { label: 'Recibida', color: 'bg-warm-200 text-warm-700' },
  { label: 'En Produccion', color: 'bg-clay-100 text-clay-700' },
  { label: 'Revision de Calidad', color: 'bg-gold-400/20 text-gold-600' },
  { label: 'Empaque y Transporte', color: 'bg-sage-100 text-sage-600' },
  { label: 'Entregada', color: 'bg-sage-100 text-sage-600' },
]

const STATUS_BADGE = {
  'Entregada': 'bg-sage-100 text-sage-700',
  'En Produccion': 'bg-clay-100 text-clay-700',
  'Recibida': 'bg-warm-200 text-warm-600',
  'Revision de Calidad': 'bg-gold-400/20 text-gold-600',
  'Empaque y Transporte': 'bg-sage-50 text-sage-600',
}

export function AdminDashboard() {
  const { products, loading: productsLoading } = useProducts()
  const { materials, loading: materialsLoading } = useMaterials()
  const { orders } = useOrders()

  if (productsLoading || materialsLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  const totalAvailable = products.reduce((s, p) => s + p.available, 0)
  const lowStockProducts = products.filter(p => p.status === 'Stock Bajo').length
  const lowStockMaterials = materials.filter(m => m.status === 'Stock Bajo').length
  const pendingOrders = orders.filter(o => o.status === 'Recibida').length
  const inProductionOrders = orders.filter(o => o.status === 'En Produccion').length
  const deliveredOrders = orders.filter(o => o.status === 'Entregada').length
  const recentOrders = [...orders].slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Dashboard</h1>
        <p className="text-warm-600 text-sm mt-0.5">Resumen del estado de producción</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Productos en catálogo', value: products.length, Icon: Package, accent: 'text-clay-500', bg: 'bg-clay-50', border: 'border-clay-200' },
          { label: 'Unidades disponibles', value: totalAvailable, Icon: ShoppingBag, accent: 'text-sage-500', bg: 'bg-sage-50', border: 'border-sage-200' },
          { label: 'Pedidos recibidos', value: pendingOrders, Icon: Clock, accent: 'text-gold-500', bg: 'bg-gold-400/10', border: 'border-gold-400/30' },
          { label: 'Pedidos entregados', value: deliveredOrders, Icon: CheckCircle, accent: 'text-sage-600', bg: 'bg-sage-50', border: 'border-sage-200' },
        ].map(({ label, value, Icon, accent, bg, border }) => (
          <div key={label} className={`bg-warm-50 border ${border} rounded-2xl p-5`}>
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={18} className={accent} />
            </div>
            <p className="font-display text-3xl font-bold text-espresso">{value}</p>
            <p className="text-xs text-warm-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockProducts > 0 || lowStockMaterials > 0) && (
        <div className="bg-gold-400/10 border border-gold-400/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-gold-500 shrink-0 mt-0.5" />
          <div className="text-sm text-warm-800">
            {lowStockProducts > 0 && (
              <p><strong className="text-espresso">{lowStockProducts} productos</strong> con stock bajo en el catálogo.</p>
            )}
            {lowStockMaterials > 0 && (
              <p><strong className="text-espresso">{lowStockMaterials} materiales</strong> con stock bajo en bodega.</p>
            )}
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6">
        <h2 className="font-display font-semibold text-espresso mb-5">Pipeline de producción</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          {STATUS_PIPELINE.map(({ label, color }) => (
            <div key={label} className={`rounded-xl py-4 px-2 ${color}`}>
              <p className="font-display text-2xl font-bold">
                {orders.filter(o => o.status === label).length}
              </p>
              <p className="text-xs mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-espresso">Pedidos recientes</h2>
          <Link
            to="/admin/solicitudes"
            className="text-xs text-clay-500 hover:text-clay-600 flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {recentOrders.length === 0 && (
            <p className="text-warm-500 text-sm py-2">Sin pedidos aún.</p>
          )}
          {recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-warm-200 last:border-0">
              <div>
                <span className="font-medium text-espresso text-sm">{order.id}</span>
                <span className="text-warm-500 text-sm ml-2">{order.customerName}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status] ?? 'bg-warm-200 text-warm-600'}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
