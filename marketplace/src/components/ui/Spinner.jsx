export function Spinner({ className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-warm-300 border-t-clay-500 ${className}`}
      style={{ width: 24, height: 24 }}
    />
  )
}
