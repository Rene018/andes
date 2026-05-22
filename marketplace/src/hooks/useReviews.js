import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { mapReview } from '../lib/mappers'

export function useReviews(productId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!productId) { setLoading(false); return }
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('review_date', { ascending: false })
    setReviews((data || []).map(mapReview))
    setLoading(false)
  }, [productId])

  useEffect(() => { load() }, [load])

  async function addReview({ rating, comment, reviewer, reviewerType }) {
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      source: 'cliente',
      reviewer,
      reviewer_type: reviewerType ?? 'Cliente',
      avg_rating: rating,
      comment,
      review_date: new Date().toISOString().split('T')[0],
    })
    if (!error) {
      const { data: fresh } = await supabase
        .from('reviews')
        .select('avg_rating')
        .eq('product_id', productId)
      if (fresh?.length > 0) {
        const avg = fresh.reduce((s, r) => s + r.avg_rating, 0) / fresh.length
        await supabase.from('products').update({
          avg_rating: Math.round(avg * 10) / 10,
          review_count: fresh.length,
        }).eq('id', productId)
      }
      await load()
    }
    return { error: error?.message ?? null }
  }

  return { reviews, loading, addReview }
}
