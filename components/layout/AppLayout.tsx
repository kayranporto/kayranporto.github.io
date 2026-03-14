'use client'

import { ReactNode } from 'react'
import { Header, Sidebar, Footer } from './Navigation'

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <div className='flex-1 flex'>
        <div className='w-full'>
          <Sidebar />
          <main className='flex-1 p-6 bg-neutral-50'>
            <div className='container-base'>{children}</div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)]'>
      <div className='w-full max-w-md'>{children}</div>
    </div>
  )
}
