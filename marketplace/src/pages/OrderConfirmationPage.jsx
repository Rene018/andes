import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { useCart } from '../context/CartContext'
import { formatCOP } from '../utils/format'

const PIPELINE_STEPS = [
  'Recibida',
  'En Produccion',
  'Revision de Calidad',
  'Empaque y Transporte',
  'Entregada',
]

const PENDING_KEY = 'andes_pending_order'

export function OrderConfirmationPage() {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addOrder } = useOrders()
  const { clearCart } = useCart()

  // pageStatus: 'loading' | 'success' | 'failure' | 'pending'
  const [pageStatus, setPageStatus] = useState('loading')
  const [order, setOrder] = useState(state?.order ?? null)
  const [createError, setCreateError] = useState(null)
  const hasProcessed = useRef(false)

  const mpStatus = searchParams.get('status')

  useEffect(() => {
    // Llegó via navigate() con state (post-replace o flujo sin MP)
    if (!mpStatus && state?.order) {
      setPageStatus('success')
      return
    }

    // Sin params ni state — redireccionar al carrito
    if (!mpStatus) {
      navigate('/carrito', { replace: true })
      return
    }

    if (mpStatus === 'pending' || mpStatus === 'in_process') {
      sessionStorage.removeItem(PENDING_KEY)
      setPageStatus('pending')
      return
    }

    if (mpStatus !== 'approved') {
      // rejected, failure, cancelled, charged_back, etc.
      sessionStorage.removeItem(PENDING_KEY)
      setPageStatus('failure')
      return
    }

    // mpStatus === 'approved'
    if (hasProcessed.current) return
    hasProcessed.current = true

    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) {
      // Pago aprobado pero sin datos (ej: refresh después del éxito)
      setPageStatus('success')
      return
    }

    const pendingOrder = JSON.parse(raw)

    addOrder(pendingOrder)
      .then(() => {
        clearCart()
        sessionStorage.removeItem(PENDING_KEY)
        setOrder(pendingOrder)
        setPageStatus('success')
        // Reemplazar URL para evitar doble-creación al refrescar
        navigate('/pedido/confirmacion', { replace: true, state: { order: pendingOrder } })
      })
      .catch((err) => {
        console.error('[ANDES] Error al registrar pedido post-pago:', err)
        setCreateError(
          'Tu pago fue aprobado pero hubo un error al registrar el pedido. ' +
          'Guarda tu ID de pago y contáctanos para resolverlo.'
        )
        setOrder(pendingOrder)
        setPageStatus('success')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──────────────────────────────────────────────────────────────
  if (pageStatus === 'loading') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 border-4 border-warm-200 border-t-clay-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-warm-600 text-sm">Verificando tu pago...</p>
      </div>
    )
  }

  // ── Failure ───────────────────────────────────────────────────────────────
  if (pageStatus === 'failure') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-espresso mb-2">Pago no completado</h1>
        <p className="text-warm-600 mb-8 text-sm leading-relaxed">
          Tu pago no pudo ser procesado. Tu carrito sigue intacto — puedes intentarlo de nuevo.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/pedido"
            className="px-5 py-2.5 bg-clay-500 text-white font-semibold rounded-xl hover:bg-clay-600 transition-colors text-sm"
          >
            Reintentar pago
          </Link>
          <Link
            to="/carrito"
            className="px-5 py-2.5 border border-warm-300 text-warm-700 font-semibold rounded-xl hover:bg-warm-100 transition-colors text-sm"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    )
  }

  // ── Pending ───────────────────────────────────────────────────────────────
  if (pageStatus === 'pending') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-yellow-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-espresso mb-2">Pago en proceso</h1>
        <p className="text-warm-600 mb-8 text-sm leading-relaxed">
          Tu pago está siendo verificado por MercadoPago. Recibirás un correo de confirmación
          cuando se apruebe. Si no se confirma en 24 horas, contáctanos.
        </p>
        <Link
          to="/productos"
          className="px-5 py-2.5 bg-clay-500 text-white font-semibold rounded-xl hover:bg-clay-600 transition-colors text-sm"
        >
          Seguir comprando
        </Link>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-sage-500" />
      </div>

      <h1 className="font-display text-3xl font-bold text-espresso mb-2">¡Pedido recibido!</h1>

      {createError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex gap-2 items-start text-left">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{createError}</span>
        </div>
      )}

      {order && (
        <>
          <p className="text-warm-600 mb-1 text-sm">
            Número de pedido: <span className="font-semibold text-espresso font-mono">{order.id}</span>
          </p>
          <p className="text-warm-600 mb-6 text-sm">
            Total: <span className="font-semibold text-espresso">{formatCOP(order.total)}</span>
          </p>
        </>
      )}

      {!order && (
        <p className="text-warm-600 mb-6 text-sm">
          Tu pago fue aprobado. Recibirás un correo de confirmación.
        </p>
      )}

      <p className="text-warm-700 mb-8 leading-relaxed text-sm">
        Hemos recibido tu solicitud. Nuestro equipo comenzará la producción y te
        contactaremos por correo o teléfono para coordinar la entrega.
      </p>

      {/* Pipeline visual */}
      <div className="bg-warm-50 border border-warm-300 rounded-2xl p-5 mb-8 text-left">
        <p className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-4">Estado del proceso</p>
        <div className="space-y-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-sage-400' : 'bg-warm-300'}`} />
              <span className={i === 0 ? 'text-espresso font-semibold' : 'text-warm-500'}>{step}</span>
              {i === 0 && (
                <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-semibold">actual</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          to="/cuenta/pedidos"
          className="px-5 py-2.5 bg-clay-500 text-white font-semibold rounded-xl hover:bg-clay-600 transition-colors text-sm"
        >
          Ver mis pedidos
        </Link>
        <Link
          to="/productos"
          className="px-5 py-2.5 border border-warm-300 text-warm-700 font-semibold rounded-xl hover:bg-warm-100 transition-colors text-sm"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
