import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mapProduct } from '../lib/mappers'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    function fetchAll() {
      return supabase
        .from('products')
        .select('*')
        .order('name')
        .then(({ data, error: err }) => {
          if (cancelled) return
          if (err) setError(err.message)
          else setProducts((data || []).map(mapProduct))
          setLoading(false)
        })
    }

    fetchAll()

    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchAll)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { products, loading, error }
}
