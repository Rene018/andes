const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const accessToken = Deno.env.get('MP_ACCESS_TOKEN')
  if (!accessToken) {
    return json({ error: 'MP_ACCESS_TOKEN no configurado' }, 500)
  }

  let body: {
    items: Array<{ id: string; title: string; quantity: number; unit_price: number }>
    payer: { name: string; email: string }
    orderId: string
    returnBaseUrl: string
  }

  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const { items, payer, orderId, returnBaseUrl } = body

  if (!items?.length || !payer?.email || !orderId || !returnBaseUrl) {
    return json({ error: 'Faltan campos requeridos' }, 400)
  }

  const preference = {
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
      currency_id: 'COP',
    })),
    payer: {
      name: payer.name,
      email: payer.email,
    },
    external_reference: orderId,
    back_urls: {
      success: `${returnBaseUrl}/pedido/confirmacion`,
      failure: `${returnBaseUrl}/pedido/confirmacion`,
      pending: `${returnBaseUrl}/pedido/confirmacion`,
    },
    statement_descriptor: 'ANDES 3D',
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const detail = await mpRes.text()
      console.error('[ANDES] MercadoPago error:', mpRes.status, detail)
      return json({ error: 'Error de MercadoPago', detail }, 502)
    }

    const { init_point, id } = await mpRes.json()
    return json({ init_point, id })
  } catch (err) {
    console.error('[ANDES] Error interno:', err)
    return json({ error: 'Error interno del servidor' }, 500)
  }
})
