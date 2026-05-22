import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export function Navbar() {
  const { totalItems } = useCart()
  const { user, profile, isAdmin, signOut } = useAuth()

  return (
    <nav className="bg-white border-b border-warm-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-display text-xl font-bold text-espresso tracking-tight">ANDES</span>
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-widest text-warm-400 border border-warm-300 rounded px-1.5 py-0.5">
            3D
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink
            to="/productos"
            className={({ isActive }) =>
              `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-clay-50 text-clay-600'
                  : 'text-warm-600 hover:text-espresso hover:bg-warm-100'
              }`
            }
          >
            Catálogo
          </NavLink>

          <NavLink
            to="/contacto"
            className={({ isActive }) =>
              `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-clay-50 text-clay-600'
                  : 'text-warm-600 hover:text-espresso hover:bg-warm-100'
              }`
            }
          >
            Comunícame
          </NavLink>

          {/* Cart — oculto para administradores */}
          {!isAdmin && (
            <Link
              to="/carrito"
              className="relative p-2 text-warm-500 hover:text-espresso transition-colors rounded-lg hover:bg-warm-100"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={19} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-clay-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-0.5">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 text-warm-500 hover:text-clay-500 transition-colors rounded-lg hover:bg-warm-100"
                  title="Panel Admin"
                >
                  <LayoutDashboard size={18} />
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/cuenta/pedidos"
                  className="p-2 text-warm-500 hover:text-espresso transition-colors rounded-lg hover:bg-warm-100"
                  title={profile?.fullName ?? 'Mi cuenta'}
                >
                  <User size={18} />
                </Link>
              )}
              <button
                onClick={signOut}
                className="p-2 text-warm-400 hover:text-red-500 transition-colors rounded-lg hover:bg-warm-100"
                title="Cerrar sesión"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="text-sm font-semibold px-4 py-1.5 bg-clay-500 text-white rounded-lg hover:bg-clay-600 transition-colors ml-1"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
