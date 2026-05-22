import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { useProducts } from '../hooks/useProducts'
import { formatCOP, generateOrderId } from '../utils/format'
import { supabase } from '../lib/supabase'

export function OrderFormPage() {
  const { items } = useCart()
  const { user, profile } = useAuth()
  useOrders() // mantiene el provider activo
  const { products } = useProducts()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: profile?.fullName ?? '',
    customerType: profile?.customerType ?? 'Docente',
    email: user?.email ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const cartProducts = items.map(item => ({
    item,
    product: products.find(p => p.id === item.productId),
  })).filter(x => x.product !== undefined)

  const total = cartProducts.reduce(
    (sum, { item, product }) => sum + (product?.price ?? 0) * item.quantity,
    0
  )

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const orderId = generateOrderId()
    const order = {
      id: orderId,
      userId: user?.id,
      customerName: form.customerName,
      customerType: form.customerType,
      email: form.email,
      phone: form.phone,
      city: form.city,
      items: cartProducts.map(({ item, product }) => ({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: product.price * item.quantity,
      })),
      total,
      status: 'Recibida',
      priority: 'Media',
      notes: form.notes || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    }

    sessionStorage.setItem('andes_pending_order', JSON.stringify(order))

    const mpItems = cartProducts.map(({ item, product }) => ({
      id: item.productId,
      title: product.name,
      quantity: item.quantity,
      unit_price: product.price,
    }))

    try {
      const { data, error } = await supabase.functions.invoke('create-mp-preference', {
        body: {
          items: mpItems,
          payer: { name: form.customerName, email: form.email },
          orderId,
          returnBaseUrl: window.location.origin,
        },
      })

      if (error || !data?.init_point) {
        console.error('[ANDES] Error al crear preferencia MP:', error)
        sessionStorage.removeItem('andes_pending_order')
        alert('No se pudo iniciar el pago. Por favor intenta de nuevo.')
        setLoading(false)
        return
      }

      window.location.href = data.init_point
    } catch (err) {
      console.error('[ANDES] Error inesperado:', err)
      sessionStorage.removeItem('andes_pending_order')
      alert('Error inesperado. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/carrito')
    return null
  }

  const inputClass =
    'w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400'
  const labelClass = 'block text-sm font-semibold text-warm-700 mb-1.5'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-clay-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Checkout</p>
        <h1 className="font-display text-3xl font-bold text-espresso">Completar pedido</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-semibold text-espresso text-lg mb-1">Datos de contacto</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre completo *</label>
                <input
                  required type="text"
                  value={form.customerName}
                  onChange={e => update('customerName', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tipo de usuario *</label>
                <select
                  value={form.customerType}
                  onChange={e => update('customerType', e.target.value)}
                  className={inputClass}
                >
                  <option value="Docente">Docente</option>
                  <option value="Cuidador">Cuidador / familiar</option>
                  <option value="Beneficiario">Beneficiario directo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Correo electrónico *</label>
                <input
                  required type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Teléfono *</label>
                <input
                  required type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  className={inputClass}
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className={labelClass}>Ciudad *</label>
                <input
                  required type="text"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notas adicionales</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Instrucciones especiales, detalles de entrega, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-clay-500 text-white font-semibold py-3.5 rounded-xl hover:bg-clay-600 disabled:opacity-60 transition-colors text-base shadow-sm"
          >
            {loading ? 'Redirigiendo a MercadoPago...' : `Ir a pagar · ${formatCOP(total)}`}
          </button>
        </form>

        {/* Resumen */}
        <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6 space-y-3 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-espresso text-lg mb-1">Resumen</h2>
          {cartProducts.map(({ item, product }) => product && (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-warm-700 truncate mr-2">{product.name} ×{item.quantity}</span>
              <span className="shrink-0 font-medium text-warm-800">{formatCOP(product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-warm-200 pt-3 flex justify-between font-bold text-espresso">
            <span>Total</span>
            <span className="font-display">{formatCOP(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
