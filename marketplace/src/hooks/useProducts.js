import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mapProduct } from '../lib/mappers'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('name')
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setProducts((data || []).map(mapProduct))
        }
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}
