'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const Header = () => {
  const { user, organization, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className='bg-[var(--primary)] text-white shadow-md'>
      <div className='container-base py-4 flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <h1 className='text-2xl font-bold'>Império Delivery</h1>
          {organization && <span className='text-sm opacity-75'>{organization.name}</span>}
        </div>

        {user && (
          <div className='flex items-center gap-4'>
            <span className='text-sm'>{user.name}</span>
            <button
              onClick={handleLogout}
              className='px-3 py-1 bg-white text-[var(--primary)] rounded hover:bg-neutral-100 transition-colors'
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export const Sidebar = () => {
  const { user } = useAuth()

  return (
    <aside className='bg-white p-4 border-b border-neutral-200'>
      <nav className='space-y-2'>
        <Link href='/dashboard' className='block px-4 py-2 hover:bg-neutral-100 rounded'>
          Dashboard
        </Link>
        <Link href='/orders' className='block px-4 py-2 hover:bg-neutral-100 rounded'>
          Pedidos
        </Link>
        <Link href='/products' className='block px-4 py-2 hover:bg-neutral-100 rounded'>
          Cardápio
        </Link>
        {user?.role === 'admin' && (
          <>
            <Link href='/users' className='block px-4 py-2 hover:bg-neutral-100 rounded'>
              Usuários
            </Link>
            <Link href='/settings' className='block px-4 py-2 hover:bg-neutral-100 rounded'>
              Configurações
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}

export const Footer = () => {
  return (
    <footer className='bg-[var(--primary-light)] text-white text-center py-4 mt-8'>
      <p>&copy; 2026 - Império Delivery SaaS | Todos os direitos reservados</p>
    </footer>
  )
}
