import { useState, useEffect } from 'react'
import { Upload, Save } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useMaterials } from '../../hooks/useMaterials'
import { StockBadge } from '../../components/ui/StockBadge'
import { supabase } from '../../lib/supabase'
import { Spinner } from '../../components/ui/Spinner'

export function AdminInventory() {
  const { products, loading: productsLoading } = useProducts()
  const { materials, loading: materialsLoading } = useMaterials()

  const [rows, setRows] = useState([])
  const [saved, setSaved] = useState(null)
  const [uploading, setUploading] = useState(null)
  const [tab, setTab] = useState('products')

  useEffect(() => {
    setRows(products.map(p => ({ ...p, editableAvailable: p.available })))
  }, [products])

  function updateAvailable(id, val) {
    setRows(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, editableAvailable: val, status: val <= 2 ? 'Stock Bajo' : 'Disponible' }
          : r
      )
    )
  }

  async function saveRow(id) {
    const row = rows.find(r => r.id === id)
    if (!row) return
    await supabase
      .from('products')
      .update({ available: row.editableAvailable, status: row.status })
      .eq('id', id)
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
  }

  async function handleStlUpload(productId, file) {
    setUploading(productId)
    const filename = `${productId}.stl`
    const { error } = await supabase.storage
      .from('3d_figuras')
      .upload(filename, file, { upsert: true })
    if (!error) {
      await supabase.from('products').update({ stl_filename: filename }).eq('id', productId)
      setRows(prev =>
        prev.map(r => (r.id === productId ? { ...r, stlFilename: filename } : r))
      )
    }
    setUploading(null)
  }

  if (productsLoading || materialsLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-espresso">Inventario</h1>
        <p className="text-warm-600 text-sm mt-0.5">Gestiona stock de productos y materiales</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: 'products', label: 'Productos' },
          { id: 'materials', label: 'Materiales' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-clay-500 text-white'
                : 'bg-warm-200 text-warm-700 hover:bg-warm-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="bg-warm-50 border border-warm-300 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead className="bg-warm-100 border-b border-warm-300">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Disponible</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Modelo 3D</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-warm-100 transition-colors">
                  <td className="px-4 py-3 text-warm-500 text-xs font-mono">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-espresso max-w-45 truncate">{row.name}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={row.editableAvailable}
                      onChange={e => updateAvailable(row.id, Number(e.target.value))}
                      className="w-16 border border-warm-300 rounded-lg px-2 py-1 text-sm text-center bg-warm-50 focus:outline-none focus:ring-2 focus:ring-clay-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1 cursor-pointer text-xs text-clay-500 hover:text-clay-600 transition-colors">
                      <Upload size={12} />
                      {uploading === row.id ? 'Subiendo...' : row.stlFilename ? 'Reemplazar' : 'Subir STL'}
                      <input
                        type="file"
                        accept=".stl"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleStlUpload(row.id, file)
                        }}
                      />
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => saveRow(row.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${
                        saved === row.id
                          ? 'bg-sage-100 text-sage-700'
                          : 'bg-clay-50 text-clay-600 hover:bg-clay-100'
                      }`}
                    >
                      <Save size={11} />
                      {saved === row.id ? 'Guardado' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'materials' && (
        <div className="bg-warm-50 border border-warm-300 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-135">
            <thead className="bg-warm-100 border-b border-warm-300">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Material</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Stock (kg)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Mín / Máx</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {materials.map(m => (
                <tr key={m.id} className="hover:bg-warm-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-espresso">{m.name}</td>
                  <td className="px-4 py-3 text-warm-600">
                    <span className="bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md text-xs font-medium">{m.type}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-espresso">{m.stock.toFixed(1)}</td>
                  <td className="px-4 py-3 text-warm-500 text-xs">{m.minStock} / {m.maxStock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      m.status === 'Stock Bajo'
                        ? 'bg-gold-400/20 text-gold-600'
                        : 'bg-sage-100 text-sage-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
