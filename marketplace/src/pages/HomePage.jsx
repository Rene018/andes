import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Layers, Printer, Truck } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/product/ProductCard'
import { categoryConfig } from '../components/product/CategoryIcon'
import { Spinner } from '../components/ui/Spinner'

const CATEGORIES = [
  'Accesibilidad Visual',
  'Material Didactico',
  'Comunicacion Aumentativa',
  'Accesibilidad Motriz',
  'Figuras Didacticas',
  'Accesorios de Accesibilidad',
]

const PROCESS_STEPS = [
  {
    Icon: Layers,
    step: '01',
    title: 'Elige tu recurso',
    desc: 'Explora el catálogo y selecciona los materiales que necesitas.',
  },
  {
    Icon: Printer,
    step: '02',
    title: 'Lo imprimimos',
    desc: 'Fabricamos tu pedido con filamento de alta calidad en Barranquilla.',
  },
  {
    Icon: Truck,
    step: '03',
    title: 'Te lo entregamos',
    desc: 'Coordinamos la entrega directamente contigo por correo o teléfono.',
  },
]

export function HomePage() {
  const { products, loading } = useProducts()

  const topRated = useMemo(
    () =>
      [...products]
        .filter(p => p.avgRating !== null)
        .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
        .slice(0, 4),
    [products]
  )

  function categoryCount(cat) {
    return products.filter(p => p.category === cat).length
  }

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-espresso overflow-hidden">
        <div className="tech-grid absolute inset-0 pointer-events-none" />
        {/* Glow central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-clay-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-28 lg:py-36 text-center">
          <h1 className="font-display font-extrabold text-white leading-[0.95] mb-6"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)' }}>
            Recursos 3D<br />
            para <span className="text-clay-400">educación</span><br />
            y <span className="text-clay-400">accesibilidad</span>
          </h1>

          <p className="text-warm-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Materiales didácticos y accesorios de accesibilidad impresos en 3D
            para docentes, cuidadores y personas que los necesitan.
          </p>

          <div className="flex items-center gap-3 justify-center flex-wrap">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 bg-clay-500 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-clay-600 transition-colors text-sm"
            >
              Ver catálogo completo
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/auth/registro"
              className="inline-flex items-center gap-2 border border-white/10 text-warm-300 font-medium px-7 py-3.5 rounded-xl hover:bg-white/5 transition-colors text-sm"
            >
              Crear cuenta
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-10 border-t border-white/10 flex justify-center gap-12">
            {[
              { value: '25+', label: 'Recursos' },
              { value: '6', label: 'Categorías' },
              { value: '100%', label: 'Hecho en Colombia' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-warm-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────── */}
      <section className="bg-white border-b border-warm-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-warm-200">
            {PROCESS_STEPS.map(({ Icon, step, title, desc }) => (
              <div key={step} className="flex gap-4 px-6 py-8 first:pl-0 last:pr-0">
                <div className="shrink-0 w-9 h-9 bg-clay-50 rounded-lg flex items-center justify-center mt-0.5">
                  <Icon size={17} className="text-clay-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-1">{step}</p>
                  <p className="font-display font-bold text-espresso text-sm mb-1">{title}</p>
                  <p className="text-warm-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-clay-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Categorías</p>
            <h2 className="font-display text-3xl font-bold text-espresso">¿Qué necesitas?</h2>
          </div>
          <Link
            to="/productos"
            className="hidden sm:flex items-center gap-1 text-sm text-warm-500 hover:text-clay-500 transition-colors font-medium"
          >
            Ver todo <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => {
            const config = categoryConfig[cat]
            return (
              <Link
                key={cat}
                to={`/productos?categoria=${encodeURIComponent(cat)}`}
                className="group flex items-center gap-4 bg-white border border-warm-200 rounded-xl px-5 py-4 hover:border-clay-300 hover:shadow-sm transition-all"
              >
                <span className="text-2xl shrink-0">{config.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-espresso text-sm leading-snug">{cat}</p>
                  <p className="text-warm-400 text-xs mt-0.5">
                    {loading ? '—' : `${categoryCount(cat)} productos`}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-warm-300 shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-clay-400 transition-all"
                />
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── MÁS VALORADOS ────────────────────────────────────────── */}
      <section className="bg-white border-t border-warm-200 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-clay-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Destacados</p>
              <h2 className="font-display text-3xl font-bold text-espresso">Más valorados</h2>
            </div>
            <Link
              to="/productos?sort=rating"
              className="flex items-center gap-1 text-sm text-warm-500 hover:text-clay-500 transition-colors font-medium"
            >
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topRated.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MATERIALES ───────────────────────────────────────────── */}
      <section className="border-t border-warm-200">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <p className="font-display font-bold text-espresso text-sm">Materiales disponibles</p>
              <p className="text-warm-500 text-xs mt-0.5">Cada recurso está fabricado con el filamento óptimo</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['PLA', 'PLA+', 'PETG', 'TPU', 'ABS', 'Resina'].map(mat => (
                <span
                  key={mat}
                  className="inline-flex items-center gap-1.5 bg-white border border-warm-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-warm-700"
                >
                  <Layers size={11} className="text-clay-400" />
                  {mat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      <section className="bg-espresso">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-20 text-center">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-clay-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-clay-400 text-[10px] font-bold uppercase tracking-widest mb-4">Tu cuenta</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Sigue el estado de tu pedido en tiempo real
              </h2>
              <p className="text-warm-500 mb-8 leading-relaxed text-sm">
                Crea tu cuenta para solicitar recursos y ver el avance de producción
                en cualquier momento.
              </p>
              <div className="flex items-center gap-3 justify-center flex-wrap">
                <Link
                  to="/auth/registro"
                  className="inline-flex items-center gap-2 bg-clay-500 text-white font-semibold px-7 py-3 rounded-xl hover:bg-clay-600 transition-colors text-sm"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  to="/productos"
                  className="text-warm-500 text-sm font-medium hover:text-white transition-colors"
                >
                  Ver catálogo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
