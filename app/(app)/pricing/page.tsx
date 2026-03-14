'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Container } from '@/components/ui/base'
import { getPlansComparison } from '@/config/pricing'

export default function PricingPage() {
  const plans = getPlansComparison()

  return (
    <AppLayout>
      <Container>
        <div className='text-center mb-12'>
          <h1 className='text-3xl font-bold mb-4'>Planos</h1>
          <p className='text-neutral-600 max-w-2xl mx-auto'>
            Escolha o plano perfeito para seu negócio e comece a crescer
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 text-center ${
                plan.highlighted ? 'ring-2 ring-[var(--primary)] transform scale-105' : ''
              }`}
            >
              <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
              <p className='text-3xl font-bold text-[var(--primary)] mb-4'>{plan.price}</p>
              <p className='text-sm text-neutral-600 mb-6'>{plan.description}</p>

              <ul className='space-y-3 mb-8 text-left'>
                {plan.features.map((feature, i) => (
                  <li key={i} className='flex items-center gap-2'>
                    <span className='text-green-600'>✓</span>
                    <span className='text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className='w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-light)] transition-colors'>
                Escolher Plano
              </button>
            </Card>
          ))}
        </div>

        <Card className='p-8 bg-blue-50'>
          <h3 className='text-lg font-semibold mb-3'>Dúvidas sobre nossos planos?</h3>
          <p className='text-neutral-700'>
            Entre em contato conosco para saber mais sobre recursos customizados e descontos para negócios maiores.
          </p>
        </Card>
      </Container>
    </AppLayout>
  )
}
