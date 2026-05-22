import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-espresso text-warm-500 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-lg font-bold text-white">ANDES</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-warm-600 border border-warm-700 rounded px-1.5 py-0.5">3D</span>
            </div>
            <p className="text-sm text-warm-600 leading-relaxed max-w-xs">
              Recursos didácticos y de accesibilidad impresos en 3D para Colombia.
            </p>
            <p className="text-xs text-warm-700 mt-2">Barranquilla, Colombia</p>
          </div>

          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2.5">
              <p className="text-warm-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Tienda</p>
              <Link to="/productos" className="text-warm-600 hover:text-clay-400 transition-colors">Catálogo</Link>
              <Link to="/carrito" className="text-warm-600 hover:text-clay-400 transition-colors">Carrito</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-warm-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Cuenta</p>
              <Link to="/auth/login" className="text-warm-600 hover:text-clay-400 transition-colors">Ingresar</Link>
              <Link to="/auth/registro" className="text-warm-600 hover:text-clay-400 transition-colors">Registrarse</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-warm-700">
          <span>© {new Date().getFullYear()} ANDES · Todos los derechos reservados</span>
          <span>Precios en COP</span>
        </div>
      </div>
    </footer>
  )
}
