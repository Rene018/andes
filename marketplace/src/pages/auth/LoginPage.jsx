import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      navigate(redirect)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-warm-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-bold text-espresso">Bienvenido de nuevo</p>
          <p className="text-warm-600 mt-2 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/auth/registro" className="text-clay-500 hover:text-clay-600 font-semibold transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>

        <div className="bg-warm-50 border border-warm-300 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay-500 text-white font-semibold py-3 rounded-xl hover:bg-clay-600 disabled:opacity-60 transition-colors mt-2 shadow-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
