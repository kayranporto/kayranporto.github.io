'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Container } from '@/components/ui/base'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { user, organization, loading } = useAuth()

  if (loading) {
    return (
      <AppLayout>
        <Container>
          <p>Carregando...</p>
        </Container>
      </AppLayout>
    )
  }

  if (!user || !organization) {
    return (
      <AppLayout>
        <Container>
          <p>Não autorizado</p>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-neutral-600'>Bem-vindo, {user.name}!</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card>
            <h3 className='text-sm font-medium text-neutral-500 mb-2'>Plano Atual</h3>
            <p className='text-2xl font-bold capitalize'>{organization.plan}</p>
          </Card>

          <Card>
            <h3 className='text-sm font-medium text-neutral-500 mb-2'>Seu Papel</h3>
            <p className='text-2xl font-bold capitalize'>{user.role}</p>
          </Card>

          <Card>
            <h3 className='text-sm font-medium text-neutral-500 mb-2'>Status</h3>
            <p className='text-2xl font-bold text-green-600'>Ativo</p>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-6'>
          <Card>
            <h2 className='text-xl font-semibold mb-4'>Próximas Ações</h2>
            <ul className='space-y-3'>
              <li className='flex items-center gap-3'>
                <span className='text-green-600'>✓</span>
                <a href='/products' className='text-[var(--primary)] hover:underline'>
                  Adicionar produtos ao cardápio
                </a>
              </li>
              <li className='flex items-center gap-3'>
                <span className='text-green-600'>✓</span>
                <a href='/orders' className='text-[var(--primary)] hover:underline'>
                  Ver pedidos
                </a>
              </li>
              {user.role === 'admin' && (
                <>
                  <li className='flex items-center gap-3'>
                    <span className='text-green-600'>✓</span>
                    <a href='/users' className='text-[var(--primary)] hover:underline'>
                      Gerenciar usuários
                    </a>
                  </li>
                  <li className='flex items-center gap-3'>
                    <span className='text-green-600'>✓</span>
                    <a href='/settings' className='text-[var(--primary)] hover:underline'>
                      Configurações da empresa
                    </a>
                  </li>
                </>
              )}
            </ul>
          </Card>
        </div>
      </Container>
    </AppLayout>
  )
}
