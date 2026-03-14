'use client'

import Link from 'next/link'
import { Container, Button } from '@/components/ui/base'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white'>
      {/* Header */}
      <header className='border-b border-white border-opacity-20'>
        <Container>
          <div className='py-4 flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>Império Delivery</h1>
            <div className='flex gap-4'>
              <Link href='/login' className='px-4 py-2 hover:bg-white hover:bg-opacity-10 rounded transition'>
                Login
              </Link>
              <Link href='/register' className='px-4 py-2 bg-white text-[var(--primary)] rounded hover:bg-opacity-90 transition'>
                Registrar
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className='py-20'>
        <Container>
          <div className='text-center max-w-3xl mx-auto'>
            <h2 className='text-5xl font-bold mb-6'>
              Plataforma SaaS para Gerenciar seu Delivery
            </h2>
            <p className='text-xl opacity-90 mb-8'>
              Escalável, segura e pronta para produção. Gerencie seus pedidos, cardápio e usuários em uma única plataforma.
            </p>
            <div className='flex justify-center gap-4'>
              <Link href='/register' className='px-6 py-3 bg-white text-[var(--primary)] rounded-lg font-semibold hover:bg-opacity-90 transition'>
                Começar Agora
              </Link>
              <Link href='/pricing' className='px-6 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition'>
                Ver Planos
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className='py-16 bg-black bg-opacity-20'>
        <Container>
          <h3 className='text-3xl font-bold text-center mb-12'>Recursos Principais</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                title: 'Autenticação Segura',
                description: 'Sistema de autenticação JWT com senhas hasheadas'
              },
              {
                title: 'Gestão Multi-Tenant',
                description: 'Suporte para múltiplas organizações isoladas'
              },
              {
                title: 'API REST Profissional',
                description: 'Endpoints bem estruturados e documentados'
              },
              {
                title: 'Planos e Limites',
                description: 'Sistema flexível de planos com controle de uso'
              },
              {
                title: 'Escalabilidade',
                description: 'Arquitetura pronta para crescimento'
              },
              {
                title: 'TypeScript',
                description: 'Tipagem forte em toda a aplicação'
              },
            ].map((feature, index) => (
              <div key={index} className='text-center'>
                <div className='text-4xl mb-3'>✨</div>
                <h4 className='text-lg font-semibold mb-2'>{feature.title}</h4>
                <p className='opacity-75'>{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className='border-t border-white border-opacity-20 py-6'>
        <Container>
          <p className='text-center text-sm opacity-75'>
            © 2026 Império Delivery SaaS. Todos os direitos reservados.
          </p>
        </Container>
      </footer>
    </div>
  )
}
