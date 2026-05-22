import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  'Accesibilidad Visual',
  'Material Didactico',
  'Comunicacion Aumentativa',
  'Accesibilidad Motriz',
  'Figuras Didacticas',
  'Accesorios de Accesibilidad',
]
const MATERIALS = ['PLA', 'PLA+', 'PETG', 'TPU', 'ABS', 'Resina']

function statusFromAvailable(n) {
  if (n <= 0) return 'Sin Stock'
  if (n <= 2) return 'Stock Bajo'
  return 'Disponible'
}

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function safeFilename(name) {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''
  const base = name.slice(0, name.length - ext.length)
  return base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') + ext
}

const input = 'w-full border border-warm-300 rounded-xl px-4 py-2.5 text-sm bg-warm-100 focus:outline-none focus:ring-2 focus:ring-clay-300 placeholder:text-warm-400'
const lbl = 'block text-sm font-semibold text-warm-700 mb-1.5'
const section = 'bg-warm-50 border border-warm-300 rounded-2xl p-6 space-y-4'

export function AdminProductNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    material: MATERIALS[0],
    price: '',
    targetAudience: '',
    piecesPerUnit: '1',
    printTime: '',
    totalTime: '',
    available: '0',
    inProduction: '0',
    reserved: '0',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [stlFiles, setStlFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleImageChange(file) {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function addStlFiles(fileList) {
    const incoming = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.stl'))
    setStlFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...incoming.filter(f => !existing.has(f.name))]
    })
  }

  async function generateNextId() {
    const { data } = await supabase.from('products').select('id')
    const nums = (data ?? [])
      .map(p => p.id?.match(/^RD-(\d+)$/))
      .filter(Boolean)
      .map(m => parseInt(m[1], 10))
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
    return `RD-${String(next).padStart(3, '0')}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const id = await generateNextId()
    const available = Number(form.available)
    const stlFolder = (stlFiles.length > 0 || imageFile) ? toSlug(form.name) : null

    const { error: insertError } = await supabase.from('products').insert({
      id,
      name: form.name,
      description: form.description,
      category: form.category,
      material: form.material,
      price: Number(form.price),
      target_audience: form.targetAudience || null,
      pieces_per_unit: Number(form.piecesPerUnit),
      print_time: form.printTime !== '' ? Number(form.printTime) : null,
      total_time: form.totalTime !== '' ? Number(form.totalTime) : null,
      available,
      in_production: Number(form.inProduction),
      reserved: Number(form.reserved),
      status: statusFromAvailable(available),
      stl_filename: stlFolder,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    if (stlFolder) {
      const { data: existing } = await supabase.storage.from('3d_figuras').list(stlFolder)
      if (existing?.length > 0) {
        await supabase.storage
          .from('3d_figuras')
          .remove(existing.map(f => `${stlFolder}/${f.name}`))
      }
      if (imageFile) {
        await supabase.storage
          .from('3d_figuras')
          .upload(`${stlFolder}/preview.png`, imageFile, { contentType: 'application/octet-stream' })
      }
      for (const file of stlFiles) {
        const stlName = safeFilename(file.name)
        await supabase.storage
          .from('3d_figuras')
          .upload(`${stlFolder}/${stlName}`, file)
      }
    }

    navigate('/admin/productos')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/admin/productos" className="text-warm-500 hover:text-warm-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Nuevo producto</h1>
          <p className="text-warm-600 text-sm mt-0.5">Agrega un recurso al catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Información básica */}
        <div className={section}>
          <h2 className="font-semibold text-espresso">Información básica</h2>

          <div>
            <label className={lbl}>Nombre *</label>
            <input
              required type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              className={input}
              placeholder="Ej. Regla Braille Táctil"
            />
          </div>

          <div>
            <label className={lbl}>Descripción *</label>
            <textarea
              required rows={3}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className={`${input} resize-none`}
              placeholder="Descripción del recurso y su utilidad..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Categoría *</label>
              <select value={form.category} onChange={e => update('category', e.target.value)} className={input}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Material *</label>
              <select value={form.material} onChange={e => update('material', e.target.value)} className={input}>
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Precio (COP) *</label>
              <input
                required type="number" min={0}
                value={form.price}
                onChange={e => update('price', e.target.value)}
                className={input}
                placeholder="25000"
              />
            </div>
            <div>
              <label className={lbl}>Público objetivo</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={e => update('targetAudience', e.target.value)}
                className={input}
                placeholder="Niños, docentes, adultos mayores..."
              />
            </div>
          </div>
        </div>

        {/* Producción */}
        <div className={section}>
          <h2 className="font-semibold text-espresso">Producción y stock</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Piezas por unidad</label>
              <input
                type="number" min={1}
                value={form.piecesPerUnit}
                onChange={e => update('piecesPerUnit', e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={lbl}>Tiempo impresión (h)</label>
              <input
                type="number" min={0} step="0.5"
                value={form.printTime}
                onChange={e => update('printTime', e.target.value)}
                className={input}
                placeholder="3.5"
              />
            </div>
            <div>
              <label className={lbl}>Tiempo total (h)</label>
              <input
                type="number" min={0} step="0.5"
                value={form.totalTime}
                onChange={e => update('totalTime', e.target.value)}
                className={input}
                placeholder="5"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Disponible</label>
              <input
                type="number" min={0}
                value={form.available}
                onChange={e => update('available', e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={lbl}>En producción</label>
              <input
                type="number" min={0}
                value={form.inProduction}
                onChange={e => update('inProduction', e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={lbl}>Reservado</label>
              <input
                type="number" min={0}
                value={form.reserved}
                onChange={e => update('reserved', e.target.value)}
                className={input}
              />
            </div>
          </div>
        </div>

        {/* Imagen de miniatura */}
        <div className={section}>
          <h2 className="font-semibold text-espresso">Imagen de miniatura</h2>
          <p className="text-xs text-warm-500 -mt-2">Se muestra en la card del catálogo. Formato PNG recomendado.</p>

          <div className="flex items-start gap-4">
            {imagePreview ? (
              <div className="relative shrink-0">
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-contain rounded-xl border border-warm-200 bg-warm-100" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute -top-1.5 -right-1.5 bg-white border border-warm-200 rounded-full p-0.5 text-warm-400 hover:text-red-500 transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-warm-300 flex items-center justify-center text-warm-300 shrink-0">
                <Upload size={22} />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-clay-500 hover:text-clay-600 transition-colors font-medium mt-1">
              <Upload size={15} />
              {imageFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleImageChange(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        {/* Modelos 3D */}
        <div className={section}>
          <h2 className="font-semibold text-espresso">Modelos 3D</h2>
          <p className="text-xs text-warm-500 -mt-2">
            Se guardan en una carpeta con el nombre del producto. Puedes subir uno o varios archivos .stl.
          </p>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-clay-500 hover:text-clay-600 transition-colors font-medium w-fit">
            <Upload size={15} />
            Seleccionar archivos .stl
            <input
              type="file"
              accept=".stl"
              multiple
              className="hidden"
              onChange={e => e.target.files && addStlFiles(e.target.files)}
            />
          </label>

          {stlFiles.length > 0 && (
            <ul className="space-y-1.5">
              {stlFiles.map(f => (
                <li key={f.name} className="flex items-center gap-2 text-xs font-mono text-warm-700 bg-warm-100 border border-warm-200 rounded-lg px-3 py-1.5">
                  <span className="flex-1 truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setStlFiles(prev => prev.filter(x => x.name !== f.name))}
                    className="text-warm-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-clay-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-clay-600 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creando...' : 'Crear producto'}
          </button>
          <Link
            to="/admin/productos"
            className="px-6 py-2.5 rounded-xl border border-warm-300 text-warm-700 text-sm font-medium hover:bg-warm-100 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
