import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { mapOrder } from '../lib/mappers'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders((data || []).map(mapOrder))
    setLoading(false)
  }, [user])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Actualización en tiempo real del estado de pedidos
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('orders-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => prev.map(o =>
          o.id === payload.new.id ? { ...o, status: payload.new.status } : o
        ))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function addOrder(order) {
    const { error: orderError } = await supabase.from('orders').insert({
      id: order.id,
      user_id: order.userId,
      customer_name: order.customerName,
      customer_type: order.customerType,
      email: order.email,
      phone: order.phone,
      city: order.city,
      total: order.total,
      status: order.status,
      notes: order.notes || null,
      priority: order.priority,
      created_at: order.createdAt,
    })

    if (orderError) throw new Error(orderError.message)

    const items = order.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }))
    await supabase.from('order_items').insert(items)

    // Descontar stock de cada producto
    for (const item of order.items) {
      const { data: prod } = await supabase
        .from('products')
        .select('available, reserved')
        .eq('id', item.productId)
        .single()

      if (prod) {
        await supabase.from('products').update({
          available: Math.max(0, prod.available - item.quantity),
          reserved: (prod.reserved ?? 0) + item.quantity,
        }).eq('id', item.productId)
      }
    }

    await loadOrders()
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  return (
    <OrderContext.Provider value={{ orders, loading, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used inside OrderProvider')
  return ctx
}
