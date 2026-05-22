import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export function useProductImage(folder) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (!folder) return
    supabase.storage
      .from('3d_figuras')
      .list(folder)
      .then(({ data }) => {
        const png = (data || []).find(f => f.name.toLowerCase().endsWith('.png'))
        if (png) {
          setImageUrl(`${SUPABASE_URL}/storage/v1/object/public/3d_figuras/${folder}/${png.name}`)
        }
      })
  }, [folder])

  return imageUrl
}
