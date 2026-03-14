'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Container, Button, Input, Label, FormGroup } from '@/components/ui/base'
import { useAuth } from '@/hooks/useAuth'
import { fetchApi } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description?: string
  price: number
}

export default function ProductsPage() {
  const { user, organization, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  })

  useEffect(() => {
    if (organization) {
      loadProducts()
    }
  }, [organization])

  const loadProducts = async () => {
    setLoading(true)
    const result = await fetchApi<Product[]>('/api/products', 'GET')
    if (result.success && result.data) {
      setProducts(result.data)
    }
    setLoading(false)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await fetchApi('/api/products', 'POST', {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
    })

    if (result.success) {
      setFormData({ name: '', price: '', description: '' })
      setShowForm(false)
      await loadProducts()
    }

    setLoading(false)
  }

  if (authLoading) return <AppLayout><Container><p>Carregando...</p></Container></AppLayout>

  return (
    <AppLayout>
      <Container>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Cardápio</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Adicionar Produto'}
          </Button>
        </div>

        {showForm && (
          <Card className='mb-6 p-6'>
            <h3 className='text-lg font-semibold mb-4'>Novo Produto</h3>
            <form onSubmit={handleAddProduct} className='space-y-4'>
              <FormGroup>
                <Label>Nome do Produto</Label>
                <Input
                  type='text'
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Preço (R$)</Label>
                <Input
                  type='number'
                  step='0.01'
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Descrição</Label>
                <Input
                  type='text'
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </FormGroup>

              <Button disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </form>
          </Card>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map(product => (
            <Card key={product.id}>
              <h3 className='text-lg font-semibold mb-2'>{product.name}</h3>
              {product.description && (
                <p className='text-sm text-neutral-600 mb-3'>{product.description}</p>
              )}
              <p className='text-2xl font-bold text-[var(--success)]'>
                {formatCurrency(product.price)}
              </p>
            </Card>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <Card className='text-center p-8'>
            <p className='text-neutral-600'>Nenhum produto adicionado ainda</p>
          </Card>
        )}
      </Container>
    </AppLayout>
  )
}
