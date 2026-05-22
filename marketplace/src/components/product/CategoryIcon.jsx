export const categoryConfig = {
  'Accesibilidad Visual': {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    emoji: '👁️',
  },
  'Material Didactico': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    emoji: '📚',
  },
  'Comunicacion Aumentativa': {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    emoji: '💬',
  },
  'Accesibilidad Motriz': {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    emoji: '✋',
  },
  'Figuras Didacticas': {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    emoji: '🔬',
  },
  'Accesorios de Accesibilidad': {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    emoji: '♿',
  },
}

export const categoryColors = Object.fromEntries(
  Object.entries(categoryConfig).map(([k, v]) => [k, `${v.bg} ${v.text}`])
)

export const categoryEmoji = Object.fromEntries(
  Object.entries(categoryConfig).map(([k, v]) => [k, v.emoji])
)

export function CategoryIcon({ category, size = 80, className = '' }) {
  const config = categoryConfig[category] ?? { bg: 'bg-zinc-100', text: 'text-zinc-600', emoji: '📦' }
  return (
    <div
      className={`flex items-center justify-center rounded-xl ${config.bg} ${config.text} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={category}
    >
      {config.emoji}
    </div>
  )
}
