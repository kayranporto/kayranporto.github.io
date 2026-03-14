'use client'

import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export const SidebarLayout = ({ children, sidebar }: LayoutProps) => {
  return (
    <div className='flex h-screen bg-neutral-100'>
      {sidebar && (
        <div className='w-64 bg-white shadow-sm border-r border-neutral-200'>
          {sidebar}
        </div>
      )}
      <div className='flex-1 flex flex-col'>
        <main className='flex-1 overflow-auto p-6'>{children}</main>
      </div>
    </div>
  )
}

export const Container = ({ children }: { children: ReactNode }) => {
  return <div className='container-base'>{children}</div>
}

export const Card = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`card-base ${className}`}>{children}</div>
}

export const Button = ({
  children,
  variant = 'primary',
  ...props
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseClass =
    variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  )
}

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <input className='input-base' {...props} />
}

export const Label = ({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label className='block text-sm font-medium text-neutral-700 mb-2' {...props}>
      {children}
    </label>
  )
}

export const FormGroup = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`mb-4 ${className}`}>{children}</div>
}
