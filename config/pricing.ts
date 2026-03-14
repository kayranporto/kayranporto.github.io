import type { PricingPlan, PlanLimits } from '@/types/index'

export const PLAN_LIMITS: Record<PricingPlan, PlanLimits> = {
  free: {
    maxOrders: 100,
    maxUsers: 1,
    maxProducts: 50,
    storageGB: 1,
    apiCallsPerDay: 1000,
  },
  pro: {
    maxOrders: 10000,
    maxUsers: 10,
    maxProducts: 500,
    storageGB: 50,
    apiCallsPerDay: 100000,
  },
  enterprise: {
    maxOrders: -1, // Ilimitado
    maxUsers: -1,
    maxProducts: -1,
    storageGB: -1,
    apiCallsPerDay: -1,
  },
}

export const PLAN_PRICES = {
  free: 0,
  pro: 99.99,
  enterprise: 0, // Contato
}

export const checkPlanLimit = (
  currentPlan: PricingPlan,
  limitType: keyof PlanLimits,
  currentUsage: number
): boolean => {
  const limit = PLAN_LIMITS[currentPlan][limitType]
  return limit === -1 || currentUsage < limit
}

export const getPlansComparison = () => {
  return [
    {
      name: 'Free',
      price: 'Grátis',
      description: 'Para começar',
      features: [
        `${PLAN_LIMITS.free.maxOrders} pedidos/mês`,
        `${PLAN_LIMITS.free.maxUsers} usuário`,
        `${PLAN_LIMITS.free.maxProducts} produtos`,
        `${PLAN_LIMITS.free.storageGB}GB armazenamento`,
      ],
    },
    {
      name: 'Pro',
      price: `R$ ${PLAN_PRICES.pro}`,
      description: 'Para pequenos negócios',
      features: [
        `${PLAN_LIMITS.pro.maxOrders} pedidos/mês`,
        `${PLAN_LIMITS.pro.maxUsers} usuários`,
        `${PLAN_LIMITS.pro.maxProducts} produtos`,
        `${PLAN_LIMITS.pro.storageGB}GB armazenamento`,
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      description: 'Para grandes operações',
      features: ['Ilimitado tudo', 'Suporte dedicado', 'Integrações customizadas', 'SLA garantido'],
    },
  ]
}
