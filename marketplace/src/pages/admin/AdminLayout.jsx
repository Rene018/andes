import { NavLink, Outlet, Navigate, Link } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, ArrowLeft, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui/Spinner'

const NAV_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/productos', label: 'Productos', Icon: Store },
  { to: '/admin/inventario', label: 'Inventario', Icon: Package },
  { to: '/admin/solicitudes', label: 'Solicitudes', Icon: ClipboardList },
]

export function AdminLayout() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <div className="min-h-screen flex bg-warm-100">
      {/* Sidebar — desktop */}
      <aside className="hidden sm:flex w-56 flex-col bg-espresso shrink-0 fixed top-0 left-0 h-full z-40">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="block">
            <span className="font-display text-xl font-bold text-clay-300">ANDES</span>
          </Link>
          <span className="text-white/40 text-xs mt-0.5 block font-medium uppercase tracking-widest">Admin</span>
        </div>

        <nav className="p-3 flex flex-col gap-0.5 flex-1">
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-clay-500/20 text-clay-300 font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white/70 text-xs transition-colors rounded-lg hover:bg-white/5"
          >
            <ArrowLeft size={14} />
            Ir al marketplace
          </Link>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col sm:ml-56">
        {/* Mobile top bar */}
        <div className="sm:hidden bg-espresso text-white">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
            <Link to="/">
              <span className="font-display text-lg font-bold text-clay-300">ANDES</span>
            </Link>
            <span className="text-white/40 text-xs uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex px-3 py-2 gap-0.5">
            {NAV_LINKS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-clay-500/20 text-clay-300 font-semibold'
                      : 'text-white/50 hover:text-white'
                  }`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
