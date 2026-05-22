import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Bogotá D.C.', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
]

const TABS = [
  { label: 'Mis pedidos', to: '/cuenta/pedidos' },
  { label: 'Mi perfil', to: '/cuenta/perfil' },
]

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()

  const [form, setForm] = useState({
    fullName: profile?.fullName ?? '',
    customerType: profile?.customerType ?? 'Docente',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    department: profile?.department ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error: err } = await updateProfile(form)
    if (err) {
      setError(err)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  const inputClass = 'w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400'
  const labelClass = 'block text-sm font-semibold text-warm-700 mb-1.5'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-6">
        <p className="text-clay-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Mi cuenta</p>
        <h1 className="font-display text-3xl font-bold text-espresso">Mi perfil</h1>
        <p className="text-warm-500 text-sm mt-1">{profile?.fullName ?? user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-warm-200">
        {TABS.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              tab.to === '/cuenta/perfil'
                ? 'text-clay-600 border-b-2 border-clay-500 -mb-px bg-white'
                : 'text-warm-500 hover:text-espresso'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Información personal */}
        <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-espresso text-base">Información personal</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input
                required type="text"
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tipo de usuario</label>
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
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className={inputClass}
                placeholder="3001234567"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Correo electrónico</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
          </div>
        </div>

        {/* Dirección de envío */}
        <div className="bg-warm-50 border border-warm-300 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-espresso text-base">Dirección de envío</h2>
            <p className="text-warm-500 text-xs mt-0.5">Se usará para agilizar tus próximos pedidos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Dirección</label>
              <input
                type="text"
                value={form.address}
                onChange={e => update('address', e.target.value)}
                className={inputClass}
                placeholder="Cra 50 # 80-20, Apto 301"
              />
            </div>

            <div>
              <label className={labelClass}>Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={e => update('city', e.target.value)}
                className={inputClass}
                placeholder="Barranquilla"
              />
            </div>

            <div>
              <label className={labelClass}>Departamento</label>
              <select
                value={form.department}
                onChange={e => update('department', e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {DEPARTMENTS.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-clay-500 text-white font-semibold rounded-xl hover:bg-clay-600 disabled:opacity-60 transition-colors text-sm"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-sage-600 font-medium">
              <CheckCircle size={15} />
              Cambios guardados
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
