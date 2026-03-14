'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Container } from '@/components/ui/base'
import { useAuth } from '@/hooks/useAuth'
import { fetchApi } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  items: any[]
  createdAt: string
}

export default function OrdersPage() {
  const { organization, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (organization) {
      loadOrders()
    }
  }, [organization])

  const loadOrders = async () => {
    setLoading(true)
    const result = await fetchApi<Order[]>('/api/orders', 'GET')
    if (result.success && result.data) {
      setOrders(result.data)
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  if (authLoading) return <AppLayout><Container><p>Carregando...</p></Container></AppLayout>

  return (
    <AppLayout>
      <Container>
        <h1 className='text-3xl font-bold mb-8'>Pedidos</h1>

        {orders.length > 0 ? (
          <div className='space-y-4'>
            {orders.map(order => (
              <Card key={order.id} className='hover:shadow-lg transition-shadow'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <p className='font-semibold'>Pedido #{order.id}</p>
                    <p className='text-sm text-neutral-600'>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status === 'pending' ? 'Pendente' : order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </span>
                </div>

                <div className='border-t border-neutral-200 pt-3 mt-3'>
                  <p className='text-2xl font-bold text-[var(--primary)]'>
                    {formatCurrency(order.total)}
                  </p>
                  <p className='text-sm text-neutral-600'>
                    {order.items?.length || 0} item(ns)
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className='text-center p-8'>
            <p className='text-neutral-600'>Nenhum pedido registrado ainda</p>
          </Card>
        )}
      </Container>
    </AppLayout>
  )
}
