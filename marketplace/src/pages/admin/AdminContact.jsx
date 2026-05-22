import { useState, useEffect } from 'react'
import { Save, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Spinner } from '../../components/ui/Spinner'

const FIELDS = [
  {
    key: 'whatsapp_number',
    label: 'Número WhatsApp',
    placeholder: '+57 300 000 0000',
    hint: 'Texto visible al usuario en la página de contacto',
  },
  {
    key: 'whatsapp_link',
    label: 'Enlace WhatsApp',
    placeholder: 'https://wa.me/573000000000',
    hint: 'URL de wa.me con el número completo sin espacios ni guiones',
  },
  {
    key: 'instagram_user',
    label: 'Usuario Instagram',
    placeholder: '@andes3d.co',
    hint: 'Texto visible al usuario (incluye el @)',
  },
  {
    key: 'instagram_link',
    label: 'Enlace Instagram',
    placeholder: 'https://instagram.com/andes3d.co',
    hint: 'URL completa del perfil de Instagram',
  },
  {
    key: 'email',
    label: 'Correo electrónico',
    placeholder: 'contacto@ejemplo.co',
    hint: 'Dirección de correo de contacto',
  },
]

export function AdminContact() {
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    supabase
      .from('contact_info')
      .select('key, value')
      .then(({ data }) => {
        if (data) {
          const obj = {}
          data.forEach(({ key, value }) => { obj[key] = value })
          setValues(obj)
        }
        setLoading(false)
      })
  }, [])

  async function saveField(key) {
    setSaving(key)
    await supabase
      .from('contact_info')
      .upsert({ key, value: values[key] ?? '' })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Información de contacto</h1>
        <p className="text-warm-600 text-sm mt-0.5">
          Estos datos aparecen en la página Comunícame y en la burbuja de WhatsApp.
        </p>
      </div>

      <div className="space-y-4">
        {FIELDS.map(({ key, label, placeholder, hint }) => (
          <div key={key} className="bg-white border border-warm-200 rounded-xl p-5">
            <label className="block text-sm font-semibold text-espresso mb-0.5">{label}</label>
            <p className="text-warm-400 text-xs mb-3">{hint}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={values[key] ?? ''}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="flex-1 border border-warm-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-warm-50"
              />
              <button
                onClick={() => saveField(key)}
                disabled={saving === key}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  saved === key
                    ? 'bg-green-100 text-green-700'
                    : 'bg-clay-500 text-white hover:bg-clay-600'
                }`}
              >
                {saved === key ? <Check size={14} /> : <Save size={14} />}
                {saved === key ? 'Guardado' : 'Guardar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
