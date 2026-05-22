import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    customerType: 'Docente',
    phone: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await signUp(form.email, form.password, {
      fullName: form.fullName,
      customerType: form.customerType,
      phone: form.phone || undefined,
    })
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      navigate('/')
    }
  }

  const inputClass =
    'w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400'
  const labelClass = 'block text-sm font-semibold text-warm-700 mb-1.5'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-warm-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-bold text-espresso">Crea tu cuenta</p>
          <p className="text-warm-600 mt-2 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/auth/login" className="text-clay-500 hover:text-clay-600 font-semibold transition-colors">
              Ingresa aquí
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
              <label className={labelClass}>Nombre completo *</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                className={inputClass}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className={labelClass}>Correo electrónico *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className={inputClass}
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className={labelClass}>Contraseña *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => update('password', e.target.value)}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className={labelClass}>Tipo de usuario *</label>
              <select
                value={form.customerType}
                onChange={e => update('customerType', e.target.value)}
                className={inputClass}
              >
                <option value="Docente">Docente</option>
                <option value="Cuidador">Cuidador / familiar</option>
                <option value="Beneficiario">Beneficiario directo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Teléfono (opcional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className={inputClass}
                placeholder="3001234567"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay-500 text-white font-semibold py-3 rounded-xl hover:bg-clay-600 disabled:opacity-60 transition-colors mt-2 shadow-sm"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
