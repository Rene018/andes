import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mapProduct } from '../lib/mappers'

export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProduct(data ? mapProduct(data) : null)
        setLoading(false)
      })
  }, [id])

  return { product, loading }
}
