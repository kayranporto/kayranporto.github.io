import { users, organizations } from '@/database/mock'
import { hashPassword, comparePasswords } from '@/lib/password'
import { validateEmail } from '@/lib/utils'
import type { User, Organization, AuthSession } from '@/types/index'

export class UserService {
  static async createUser(
    email: string,
    password: string,
    name: string,
    organizationId: string
  ): Promise<User> {
    if (!validateEmail(email)) {
      throw new Error('Email inválido')
    }

    if (users.some(u => u.email === email)) {
      throw new Error('Usuário já existe')
    }

    const hashedPassword = await hashPassword(password)
    const user: User = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users.push(user)
    return user
  }

  static async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = users.find(u => u.email === email)
    if (!user) return null

    const isValid = await comparePasswords(password, user.password)
    return isValid ? user : null
  }

  static async getUserById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null
  }

  static async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return users.filter(u => u.organizationId === organizationId)
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.find(u => u.id === id)
    if (!user) return null

    Object.assign(user, { ...updates, updatedAt: new Date() })
    return user
  }

  static async deleteUser(id: string): Promise<boolean> {
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return false

    users.splice(index, 1)
    return true
  }
}

export class OrganizationService {
  static async createOrganization(
    name: string,
    slug: string,
    ownerId: string
  ): Promise<Organization> {
    if (organizations.some(o => o.slug === slug)) {
      throw new Error('Slug já existe')
    }

    const organization: Organization = {
      id: Date.now().toString(),
      name,
      slug,
      ownerId,
      plan: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    organizations.push(organization)
    return organization
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    return organizations.find(o => o.id === id) || null
  }

  static async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return organizations.find(o => o.slug === slug) || null
  }

  static async updatePlan(id: string, plan: string): Promise<Organization | null> {
    const org = organizations.find(o => o.id === id)
    if (!org) return null

    org.plan = plan
    org.updatedAt = new Date()
    return org
  }
}

export class AuthService {
  static createSession(user: User, organization: Organization): AuthSession {
    return {
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    }
  }

  static async login(email: string, password: string): Promise<AuthSession | null> {
    const user = await UserService.validateCredentials(email, password)
    if (!user) return null

    const org = organizations.find(o => o.id === user.organizationId)
    if (!org) return null

    return this.createSession(user, org)
  }

  static async register(
    email: string,
    password: string,
    name: string,
    organizationName: string
  ): Promise<{ user: User; organization: Organization; session: AuthSession } | null> {
    try {
      const slug = organizationName.toLowerCase().replace(/\s+/g, '-')
      const organization = await OrganizationService.createOrganization(
        organizationName,
        slug,
        'temp'
      )

      const user = await UserService.createUser(email, password, name, organization.id)
      organization.ownerId = user.id

      const session = this.createSession(user, organization)

      return { user, organization, session }
    } catch (error) {
      return null
    }
  }
}
