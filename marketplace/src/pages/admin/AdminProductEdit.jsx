import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProduct } from '../../hooks/useProduct'
import { useProductFiles } from '../../hooks/useProductFiles'
import { useProductImage } from '../../hooks/useProductImage'
import { Spinner } from '../../components/ui/Spinner'

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

export function AdminProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { product, loading } = useProduct(id)
  const { files: existingFiles, loading: filesLoading } = useProductFiles(product?.stlFilename)
  const currentImageUrl = useProductImage(product?.stlFilename)

  const [form, setForm] = useState(null)
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState(null)
  const [newStlFiles, setNewStlFiles] = useState([])
  const [deletingFile, setDeletingFile] = useState(null)
  const [localFiles, setLocalFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!product) return
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      category: product.category ?? CATEGORIES[0],
      material: product.material ?? MATERIALS[0],
      price: product.price ?? '',
      targetAudience: product.targetAudience ?? '',
      piecesPerUnit: product.piecesPerUnit ?? '1',
      printTime: product.printTime ?? '',
      totalTime: product.totalTime ?? '',
      available: product.available ?? 0,
      inProduction: product.inProduction ?? 0,
      reserved: product.reserved ?? 0,
    })
  }, [product])

  useEffect(() => {
    setLocalFiles(existingFiles)
  }, [existingFiles])

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleImageChange(file) {
    if (!file) return
    setNewImageFile(file)
    setNewImagePreview(URL.createObjectURL(file))
  }

  function addNewFiles(fileList) {
    const incoming = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.stl'))
    setNewStlFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...incoming.filter(f => !existing.has(f.name))]
    })
  }

  async function handleDeleteFile(fileName) {
    if (!product.stlFilename) return
    setDeletingFile(fileName)
    await supabase.storage
      .from('3d_figuras')
      .remove([`${product.stlFilename}/${fileName}`])
    setLocalFiles(prev => prev.filter(f => f.name !== fileName))
    setDeletingFile(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const available = Number(form.available)
    const remainingFiles = localFiles.length + newStlFiles.length
    let stlFolder = product.stlFilename

    if (!stlFolder && newStlFiles.length > 0) {
      stlFolder = toSlug(form.name)
    }
    if (remainingFiles === 0) {
      stlFolder = null
    }

    const { error: updateError } = await supabase.from('products').update({
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
    }).eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    if (stlFolder) {
      if (newImageFile) {
        const { data: existing } = await supabase.storage.from('3d_figuras').list(stlFolder)
        const oldPngs = (existing ?? []).filter(f => f.name.toLowerCase().endsWith('.png'))
        if (oldPngs.length > 0) {
          await supabase.storage
            .from('3d_figuras')
            .remove(oldPngs.map(f => `${stlFolder}/${f.name}`))
        }
        await supabase.storage
          .from('3d_figuras')
          .upload(`${stlFolder}/preview.png`, newImageFile, { contentType: 'application/octet-stream' })
        setNewImageFile(null)
        setNewImagePreview(null)
      }
      for (const file of newStlFiles) {
        await supabase.storage
          .from('3d_figuras')
          .upload(`${stlFolder}/${file.name}`, file, { upsert: true })
      }
      setNewStlFiles([])
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading || !form) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-warm-500">
        Producto no encontrado.{' '}
        <Link to="/admin/productos" className="text-clay-500 hover:text-clay-600 font-semibold">Volver</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/admin/productos" className="text-warm-500 hover:text-warm-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Editar producto</h1>
          <p className="text-warm-500 text-xs font-mono mt-0.5">{id}</p>
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
            />
          </div>

          <div>
            <label className={lbl}>Descripción *</label>
            <textarea
              required rows={3}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className={`${input} resize-none`}
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
              />
            </div>
            <div>
              <label className={lbl}>Público objetivo</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={e => update('targetAudience', e.target.value)}
                className={input}
              />
            </div>
          </div>
        </div>

        {/* Producción y stock */}
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
              />
            </div>
            <div>
              <label className={lbl}>Tiempo total (h)</label>
              <input
                type="number" min={0} step="0.5"
                value={form.totalTime}
                onChange={e => update('totalTime', e.target.value)}
                className={input}
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
          <p className="text-xs text-warm-500 -mt-2">Se muestra en la card del catálogo.</p>

          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={newImagePreview ?? currentImageUrl ?? null}
                alt="miniatura"
                className={`w-24 h-24 object-contain rounded-xl border border-warm-200 bg-warm-100 ${!(newImagePreview ?? currentImageUrl) ? 'hidden' : ''}`}
              />
              {!(newImagePreview ?? currentImageUrl) && (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-warm-300 flex items-center justify-center text-warm-300">
                  <Upload size={22} />
                </div>
              )}
              {newImagePreview && (
                <button
                  type="button"
                  onClick={() => { setNewImageFile(null); setNewImagePreview(null) }}
                  className="absolute -top-1.5 -right-1.5 bg-white border border-warm-200 rounded-full p-0.5 text-warm-400 hover:text-red-500 transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-clay-500 hover:text-clay-600 transition-colors font-medium mt-1">
              <Upload size={15} />
              {currentImageUrl ? 'Reemplazar imagen' : 'Subir imagen'}
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

          {/* Archivos existentes */}
          {filesLoading ? (
            <Spinner />
          ) : localFiles.length > 0 ? (
            <div>
              <p className="text-xs text-warm-500 mb-2">Archivos actuales</p>
              <ul className="space-y-1.5">
                {localFiles.map(f => (
                  <li key={f.name} className="flex items-center gap-2 text-xs font-mono text-warm-700 bg-warm-100 border border-warm-200 rounded-lg px-3 py-1.5">
                    <span className="flex-1 truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.name)}
                      disabled={deletingFile === f.name}
                      className="text-warm-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                    >
                      {deletingFile === f.name ? <Spinner /> : <Trash2 size={12} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-warm-400">Sin modelos 3D cargados.</p>
          )}

          {/* Subir nuevos */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-clay-500 hover:text-clay-600 transition-colors font-medium w-fit">
            <Upload size={15} />
            {localFiles.length > 0 ? 'Agregar más archivos .stl' : 'Subir archivos .stl'}
            <input
              type="file"
              accept=".stl"
              multiple
              className="hidden"
              onChange={e => e.target.files && addNewFiles(e.target.files)}
            />
          </label>

          {newStlFiles.length > 0 && (
            <div>
              <p className="text-xs text-warm-500 mb-1.5">Nuevos archivos (se subirán al guardar)</p>
              <ul className="space-y-1.5">
                {newStlFiles.map(f => (
                  <li key={f.name} className="flex items-center gap-2 text-xs font-mono text-clay-700 bg-clay-50 border border-clay-200 rounded-lg px-3 py-1.5">
                    <span className="flex-1 truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewStlFiles(prev => prev.filter(x => x.name !== f.name))}
                      className="text-clay-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-clay-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-clay-600 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="text-sm text-sage-700 font-medium">Cambios guardados</span>
          )}
          <Link
            to="/admin/productos"
            className="ml-auto px-6 py-2.5 rounded-xl border border-warm-300 text-warm-700 text-sm font-medium hover:bg-warm-100 transition-colors"
          >
            Volver
          </Link>
        </div>
      </form>
    </div>
  )
}
