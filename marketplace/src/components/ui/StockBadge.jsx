export function StockBadge({ status, available }) {
  const isLow = status === 'Stock Bajo'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isLow
          ? 'bg-gold-400/20 text-gold-600'
          : 'bg-sage-100 text-sage-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-gold-500' : 'bg-sage-400'}`} />
      {status}
      {available !== undefined && ` · ${available} uds`}
    </span>
  )
}
