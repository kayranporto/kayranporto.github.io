'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/AppLayout'
import { Card, Input, Button, Label, FormGroup } from '@/components/ui/base'
import { fetchApi } from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await fetchApi('/api/auth/login', 'POST', formData)

    if (result.success) {
      const token = (result.data as any).token
      localStorage.setItem('authToken', token)
      router.push('/dashboard')
    } else {
      setError(result.error || 'Erro ao fazer login')
    }

    setLoading(false)
  }

  return (
    <AuthLayout>
      <Card className='p-6'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Faça Login</h2>

        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormGroup>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor='password'>Senha</Label>
            <Input
              id='password'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button disabled={loading} className='w-full'>
            {loading ? 'Fazendo login...' : 'Fazer Login'}
          </Button>
        </form>

        <p className='text-center text-sm text-neutral-600 mt-4'>
          Não tem conta? <a href='/register' className='text-[var(--primary)] hover:underline'>Criar conta</a>
        </p>
      </Card>
    </AuthLayout>
  )
}
