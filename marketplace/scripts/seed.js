import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env manually — do NOT use dotenv (it may not be installed)
function loadEnv() {
  const envPath = join(__dirname, '..', '.env')
  const env = {}
  try {
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      env[key] = val
    }
  } catch {
    console.error('[seed] No se encontró el archivo .env')
    process.exit(1)
  }
  return env
}

const env = loadEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const serviceKey =
  env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('[seed] Falta VITE_SUPABASE_URL en .env')
  process.exit(1)
}

const isServiceRole = serviceKey.startsWith('eyJ')
if (!isServiceRole) {
  console.warn('[seed] ADVERTENCIA: No se detectó una service role key (JWT). Si hay errores de RLS, deshabilita RLS temporalmente en el SQL Editor de Supabase.')
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// --- Importar datos ---
const { products } = await import('../src/data/products.js')
const { reviews } = await import('../src/data/reviews.js')
const { materials } = await import('../src/data/materials.js')
const { seedOrders } = await import('../src/data/seedOrders.js')

async function seed() {
  console.log('=== ANDES Seed ===\n')

  // 1. Products
  console.log(`Insertando ${products.length} productos...`)
  const productRows = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    material: p.material,
    price: p.price,
    category: p.category,
    target_audience: p.targetAudience,
    stl_filename: p.stlFilename,
    available: p.available,
    in_production: p.inProduction,
    reserved: p.reserved,
    status: p.status,
    print_time: p.printTime,
    total_time: p.totalTime,
    pieces_per_unit: p.piecesPerUnit,
    avg_rating: p.avgRating,
    review_count: p.reviewCount,
  }))
  const { error: prodErr } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'id' })
  if (prodErr) { console.error('[products]', prodErr.message); process.exit(1) }
  console.log('  ✓ Productos insertados\n')

  // 2. Reviews
  console.log(`Insertando ${reviews.length} reseñas...`)
  const reviewRows = reviews.map(r => ({
    product_id: r.productId,
    source: r.source,
    reviewer: r.reviewer,
    reviewer_type: r.reviewerType,
    avg_rating: r.avgRating,
    comment: r.comment,
    review_date: r.reviewDate || null,
  }))
  // Delete existing and re-insert (no unique key beyond serial id)
  await supabase.from('reviews').delete().neq('id', 0)
  const { error: revErr } = await supabase.from('reviews').insert(reviewRows)
  if (revErr) { console.error('[reviews]', revErr.message); process.exit(1) }
  console.log('  ✓ Reseñas insertadas\n')

  // 3. Materials
  console.log(`Insertando ${materials.length} materiales...`)
  const materialRows = materials.map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    color: m.color,
    stock: m.stock,
    min_stock: m.minStock,
    max_stock: m.maxStock,
    supplier: m.supplier,
    status: m.status,
  }))
  const { error: matErr } = await supabase
    .from('materials')
    .upsert(materialRows, { onConflict: 'id' })
  if (matErr) { console.error('[materials]', matErr.message); process.exit(1) }
  console.log('  ✓ Materiales insertados\n')

  // 4. Orders + order_items
  console.log(`Insertando ${seedOrders.length} pedidos...`)
  const orderRows = seedOrders.map(o => ({
    id: o.id,
    user_id: null,
    customer_name: o.customerName,
    customer_type: o.customerType,
    institution: o.institution || null,
    email: o.email,
    phone: o.phone,
    city: o.city,
    total: o.total,
    status: o.status,
    notes: o.notes || null,
    priority: o.priority,
    created_at: o.createdAt,
  }))
  const { error: ordErr } = await supabase
    .from('orders')
    .upsert(orderRows, { onConflict: 'id' })
  if (ordErr) { console.error('[orders]', ordErr.message); process.exit(1) }

  const itemRows = seedOrders.flatMap(o =>
    o.items.map(item => ({
      order_id: o.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }))
  )
  // Clear existing items for seeded orders, then re-insert
  const orderIds = seedOrders.map(o => o.id)
  await supabase.from('order_items').delete().in('order_id', orderIds)
  const { error: itemErr } = await supabase.from('order_items').insert(itemRows)
  if (itemErr) { console.error('[order_items]', itemErr.message); process.exit(1) }
  console.log('  ✓ Pedidos e ítems insertados\n')

  console.log('=== Seed completado exitosamente ===')
}

seed().catch(err => {
  console.error('[seed] Error inesperado:', err.message)
  process.exit(1)
})
