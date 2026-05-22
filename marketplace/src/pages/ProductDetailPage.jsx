import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Clock, Layers, User } from 'lucide-react'
import { useProduct } from '../hooks/useProduct'
import { useReviews } from '../hooks/useReviews'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatCOP, formatHours } from '../utils/format'
import { StarRating } from '../components/ui/StarRating'
import { StockBadge } from '../components/ui/StockBadge'
import { CategoryIcon } from '../components/product/CategoryIcon'
import { ModelViewer } from '../components/viewer/ModelViewer'
import { Spinner } from '../components/ui/Spinner'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const { user, profile } = useAuth()
  const [qty, setQty] = useState(1)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const { product, loading } = useProduct(id)
  const { reviews, addReview } = useReviews(id)

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.avgRating, 0) / reviews.length
    : product?.avgRating

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-xl text-warm-600 mb-4">Producto no encontrado.</p>
        <Link to="/productos" className="text-clay-500 hover:text-clay-600 font-medium transition-colors">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const stlUrl = `${SUPABASE_URL}/storage/v1/object/public/3d_figuras/${product.stlFilename}`
  const cartItem = items.find(i => i.productId === product.id)

  function handleAddToCart() {
    addItem(product.id, qty)
    navigate('/carrito')
  }

  async function handleReviewSubmit(e) {
    e.preventDefault()
    if (reviewRating === 0) return
    setReviewSubmitting(true)
    setReviewError(null)
    const { error } = await addReview({
      rating: reviewRating,
      comment: reviewComment,
      reviewer: profile?.fullName ?? user.email,
      reviewerType: profile?.customerType ?? 'Cliente',
    })
    setReviewSubmitting(false)
    if (error) {
      setReviewError('No se pudo publicar la reseña. Inténtalo de nuevo.')
    } else {
      setReviewDone(true)
    }
  }

  return (
    <div className="bg-warm-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-warm-600 hover:text-clay-500 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 3D Viewer */}
          <div>
            {SUPABASE_URL && SUPABASE_URL !== 'https://your-project.supabase.co' ? (
              <ModelViewer stlUrl={stlUrl} />
            ) : (
              <div
                className="rounded-2xl bg-warm-50 border border-warm-300 flex items-center justify-center"
                style={{ height: 380 }}
              >
                <CategoryIcon category={product.category} size={160} />
              </div>
            )}
            <p className="text-xs text-warm-400 text-center mt-2 font-mono">{product.id} · {product.stlFilename}</p>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs font-semibold text-clay-500 uppercase tracking-wider">{product.category}</span>
              <h1 className="font-display text-3xl font-bold text-espresso mt-1 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={avgRating} count={reviews.length || product.reviewCount} size="md" />
              <StockBadge status={product.status} available={product.available} />
            </div>

            <p className="text-warm-700 leading-relaxed">{product.description}</p>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { Icon: Layers, iconColor: 'text-clay-400', label: 'Material', value: product.material },
                { Icon: Clock, iconColor: 'text-sage-400', label: 'Tiempo total', value: formatHours(product.totalTime) },
                { Icon: Layers, iconColor: 'text-warm-500', label: 'Piezas por unidad', value: product.piecesPerUnit },
                { Icon: User, iconColor: 'text-gold-500', label: 'Público objetivo', value: product.targetAudience },
              ].map(({ Icon, iconColor, label, value }) => (
                <div key={label} className="bg-warm-50 border border-warm-200 rounded-xl p-3 flex items-start gap-2.5">
                  <Icon size={15} className={`${iconColor} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-xs text-warm-500">{label}</p>
                    <p className="text-sm font-medium text-espresso leading-tight">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="border-t border-warm-200 pt-4">
              <p className="font-display text-4xl font-bold text-espresso">{formatCOP(product.price)}</p>
              <p className="text-xs text-warm-500 mt-0.5">Precio por unidad · COP</p>
            </div>

            {/* Add to cart */}
            {product.available > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-warm-300 rounded-xl overflow-hidden bg-warm-50">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-warm-600 hover:bg-warm-100 hover:text-espresso transition-colors font-medium"
                  >−</button>
                  <span className="px-4 py-2.5 text-sm font-semibold text-espresso border-x border-warm-300">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.available, q + 1))}
                    className="px-3.5 py-2.5 text-warm-600 hover:bg-warm-100 hover:text-espresso transition-colors font-medium"
                  >+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-clay-500 text-white font-semibold py-2.5 rounded-xl hover:bg-clay-600 transition-colors shadow-sm"
                >
                  <ShoppingCart size={17} />
                  {cartItem ? 'Agregar más' : 'Agregar al carrito'}
                </button>
              </div>
            ) : (
              <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-4 text-sm text-warm-800">
                Producto sin stock disponible actualmente. Contáctanos para consultar disponibilidad.
              </div>
            )}
          </div>
        </div>

        {/* Reseñas */}
        <section className="mt-14 border-t border-warm-200 pt-10">
          <h2 className="font-display text-2xl font-bold text-espresso mb-8">
            Reseñas {reviews.length > 0 && <span className="text-warm-400 font-normal text-lg">({reviews.length})</span>}
          </h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {reviews.map(r => (
                <div key={r.id} className="bg-warm-50 border border-warm-200 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-espresso text-sm">{r.reviewer}</p>
                      <p className="text-xs text-warm-500">{r.reviewerType}</p>
                    </div>
                    <StarRating rating={r.avgRating} />
                  </div>
                  <p className="text-sm text-warm-700 italic leading-relaxed">"{r.comment}"</p>
                  {r.reviewDate && (
                    <p className="text-xs text-warm-400">{r.reviewDate}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-warm-500 text-sm mb-10">Aún no hay reseñas para este producto.</p>
          )}

          {/* Review form */}
          {user ? (
            reviewDone ? (
              <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5 text-sage-700 text-sm max-w-lg">
                ¡Gracias por tu reseña! Ya está visible arriba.
              </div>
            ) : (
              <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6 max-w-lg">
                <h3 className="font-display font-semibold text-espresso mb-5 text-lg">Dejar una reseña</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-warm-700 mb-2">Calificación *</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-3xl leading-none transition-colors ${
                            star <= reviewRating ? 'text-gold-400' : 'text-warm-200 hover:text-gold-300'
                          }`}
                        >★</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">Comentario *</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Cuéntanos tu experiencia con este producto..."
                      className="w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 resize-none placeholder:text-warm-400"
                    />
                  </div>

                  {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}

                  <button
                    type="submit"
                    disabled={reviewRating === 0 || reviewSubmitting}
                    className="bg-clay-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-clay-600 disabled:opacity-50 transition-colors"
                  >
                    {reviewSubmitting ? 'Publicando...' : 'Publicar reseña'}
                  </button>
                </form>
              </div>
            )
          ) : (
            <p className="text-sm text-warm-500">
              <Link to="/auth/login" className="text-clay-500 hover:text-clay-600 font-semibold transition-colors">
                Inicia sesión
              </Link>
              {' '}para dejar una reseña.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
