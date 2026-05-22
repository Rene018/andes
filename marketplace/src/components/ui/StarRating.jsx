import { Star } from 'lucide-react'

export function StarRating({ rating, count, size = 'sm' }) {
  if (rating === null || rating === undefined) {
    return <span className="text-warm-400 text-xs">Sin reseñas</span>
  }

  const starSize = size === 'sm' ? 12 : 16
  const stars = Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    key: i,
  }))

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map(({ filled, key }) => (
          <Star
            key={key}
            size={starSize}
            className={filled ? 'fill-gold-400 text-gold-400' : 'text-warm-300'}
          />
        ))}
      </div>
      <span className="text-warm-700 text-xs font-semibold">{rating.toFixed(1)}</span>
      {count !== undefined && count > 0 && (
        <span className="text-warm-400 text-xs">({count})</span>
      )}
    </div>
  )
}
