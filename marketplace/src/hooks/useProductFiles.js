import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProductFiles(folder) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!folder) return
    setLoading(true)
    setFiles([])
    supabase.storage
      .from('3d_figuras')
      .list(folder)
      .then(({ data, error }) => {
        if (error) {
          console.error('[useProductFiles] list error:', error)
          setFiles([])
        } else {
          setFiles((data || []).filter(f => f.name.toLowerCase().endsWith('.stl')))
        }
        setLoading(false)
      })
  }, [folder])

  return { files, loading }
}
