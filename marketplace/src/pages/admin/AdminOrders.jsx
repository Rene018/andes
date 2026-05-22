import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { useOrders } from '../../context/OrderContext'
import { formatCOP } from '../../utils/format'

const STATUSES = [
  'Recibida',
  'En Produccion',
  'Revision de Calidad',
  'Empaque y Transporte',
  'Entregada',
]

const STATUS_COLORS = {
  'Recibida': 'bg-warm-200 text-warm-700',
  'En Produccion': 'bg-clay-100 text-clay-700',
  'Revision de Calidad': 'bg-gold-400/20 text-gold-600',
  'Empaque y Transporte': 'bg-sage-50 text-sage-600',
  'Entregada': 'bg-sage-100 text-sage-700',
}

export function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders()
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filtered = filterStatus === 'Todos'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Solicitudes</h1>
        <p className="text-warm-600 text-sm mt-0.5">Gestiona el estado de los pedidos de producción</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-warm-600 text-sm">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</p>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-warm-300 rounded-xl px-3 py-1.5 bg-warm-50 text-warm-700 focus:outline-none focus:ring-2 focus:ring-clay-300"
        >
          <option value="Todos">Todos los estados</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-warm-50 border border-warm-300 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-warm-100 border-b border-warm-300">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide hidden sm:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-warm-100 transition-colors">
                <td className="px-4 py-3 font-medium text-espresso font-mono text-xs">{order.id}</td>
                <td className="px-4 py-3 text-warm-700 hidden sm:table-cell">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-warm-500 text-xs">{order.customerType}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      className={`appearance-none pr-6 pl-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-espresso">{formatCOP(order.total)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-xs text-clay-500 hover:text-clay-600 font-medium transition-colors"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-14 text-warm-500 text-sm">
            No hay pedidos para este estado.
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-warm-50 rounded-2xl w-full max-w-md shadow-2xl border border-warm-300">
            <div className="flex items-center justify-between p-6 border-b border-warm-200">
              <div>
                <h3 className="font-display font-bold text-espresso">Pedido {selectedOrder.id}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${STATUS_COLORS[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-warm-400 hover:text-warm-700 transition-colors rounded-lg hover:bg-warm-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Cliente', value: selectedOrder.customerName },
                  { label: 'Tipo', value: selectedOrder.customerType },
                  { label: 'Email', value: selectedOrder.email },
                  { label: 'Teléfono', value: selectedOrder.phone },
                  { label: 'Ciudad', value: selectedOrder.city },
                  { label: 'Fecha', value: selectedOrder.createdAt },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-warm-500 text-xs mb-0.5">{label}</p>
                    <p className="text-espresso font-medium">{value ?? '—'}</p>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className="bg-warm-100 rounded-xl p-3 text-sm">
                  <p className="text-warm-500 text-xs mb-0.5">Notas</p>
                  <p className="text-warm-800">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t border-warm-200 pt-4 space-y-2">
                <p className="text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">Productos</p>
                {selectedOrder.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-warm-700">{item.productName} ×{item.quantity}</span>
                    <span className="font-medium text-espresso">{formatCOP(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-espresso pt-2 border-t border-warm-200">
                  <span>Total</span>
                  <span>{formatCOP(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
