export type UserRole = 'admin' | 'manager' | 'user'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: UserRole
  status: UserStatus
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  ownerId: string
  plan: PricingPlan
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  userId: string
  organizationId: string
  role: UserRole
  expiresAt: Date
}

export type PricingPlan = 'free' | 'pro' | 'enterprise'

export interface PlanLimits {
  maxOrders: number
  maxUsers: number
  maxProducts: number
  storageGB: number
  apiCallsPerDay: number
}
