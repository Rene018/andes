const ALL_CATEGORIES = [
  'Accesibilidad Visual',
  'Material Didactico',
  'Comunicacion Aumentativa',
  'Accesibilidad Motriz',
  'Figuras Didacticas',
  'Accesorios de Accesibilidad',
]

const ALL_MATERIALS = ['PLA', 'PLA+', 'PETG', 'TPU', 'ABS', 'Resina']

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
          checked
            ? 'bg-clay-500 border-clay-500'
            : 'border-warm-300 group-hover:border-clay-400 bg-warm-50'
        }`}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`text-sm transition-colors ${checked ? 'text-clay-600 font-medium' : 'text-warm-700 group-hover:text-espresso'}`}>
        {label}
      </span>
    </label>
  )
}

export function ProductFilter({ filters, onChange }) {
  function toggleCategory(cat) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: next })
  }

  function toggleMaterial(mat) {
    const next = filters.materials.includes(mat)
      ? filters.materials.filter(m => m !== mat)
      : [...filters.materials, mat]
    onChange({ ...filters, materials: next })
  }

  return (
    <aside className="w-full space-y-6">
      <div>
        <h3 className="font-semibold text-espresso text-xs uppercase tracking-wider mb-3">Ordenar por</h3>
        <select
          value={filters.sortBy}
          onChange={e => onChange({ ...filters, sortBy: e.target.value })}
          className="w-full text-sm border border-warm-300 rounded-xl px-3 py-2 bg-warm-50 text-warm-700 focus:outline-none focus:ring-2 focus:ring-clay-300"
        >
          <option value="name">Nombre A–Z</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="rating">Mejor valorados</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-espresso text-xs uppercase tracking-wider mb-3">Disponibilidad</h3>
        <CheckItem
          label="Solo disponibles"
          checked={filters.onlyAvailable}
          onChange={() => onChange({ ...filters, onlyAvailable: !filters.onlyAvailable })}
        />
      </div>

      <div>
        <h3 className="font-semibold text-espresso text-xs uppercase tracking-wider mb-3">Categoría</h3>
        <div className="space-y-2.5">
          {ALL_CATEGORIES.map(cat => (
            <CheckItem
              key={cat}
              label={cat}
              checked={filters.categories.includes(cat)}
              onChange={() => toggleCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-espresso text-xs uppercase tracking-wider mb-3">Material</h3>
        <div className="space-y-2.5">
          {ALL_MATERIALS.map(mat => (
            <CheckItem
              key={mat}
              label={mat}
              checked={filters.materials.includes(mat)}
              onChange={() => toggleMaterial(mat)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => onChange({
          categories: [],
          materials: [],
          onlyAvailable: false,
          priceMin: 0,
          priceMax: 100000,
          sortBy: 'name',
        })}
        className="text-xs text-clay-500 hover:text-clay-600 font-medium transition-colors"
      >
        Limpiar filtros
      </button>
    </aside>
  )
}
