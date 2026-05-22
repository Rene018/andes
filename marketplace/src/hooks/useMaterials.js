import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mapMaterial } from '../lib/mappers'

export function useMaterials() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('materials')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setMaterials((data || []).map(mapMaterial))
        setLoading(false)
      })
  }, [])

  return { materials, loading }
}
