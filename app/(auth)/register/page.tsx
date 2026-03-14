'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/AppLayout'
import { Card, Input, Button, Label, FormGroup } from '@/components/ui/base'
import { fetchApi } from '@/lib/api-client'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organizationName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem')
      setLoading(false)
      return
    }

    const result = await fetchApi('/api/auth/register', 'POST', {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      organizationName: formData.organizationName,
    })

    if (result.success) {
      const token = (result.data as any).token
      localStorage.setItem('authToken', token)
      router.push('/dashboard')
    } else {
      setError(result.error || 'Erro ao registrar')
    }

    setLoading(false)
  }

  return (
    <AuthLayout>
      <Card className='p-6'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Criar Conta</h2>

        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormGroup>
            <Label htmlFor='name'>Nome Completo</Label>
            <Input
              id='name'
              name='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

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
            <Label htmlFor='organizationName'>Nome da Empresa</Label>
            <Input
              id='organizationName'
              name='organizationName'
              type='text'
              value={formData.organizationName}
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
            <p className='text-xs text-neutral-500 mt-2'>
              Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial
            </p>
          </FormGroup>

          <FormGroup>
            <Label htmlFor='confirmPassword'>Confirmar Senha</Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button disabled={loading} className='w-full'>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <p className='text-center text-sm text-neutral-600 mt-4'>
          Já tem conta? <a href='/login' className='text-[var(--primary)] hover:underline'>Faça login</a>
        </p>
      </Card>
    </AuthLayout>
  )
}
