// Mock database para demonstração
// Em produção, usar Prisma, Neon, Supabase, etc.

export const users: any[] = []
export const organizations: any[] = []
export const products: any[] = []
export const orders: any[] = []

export const resetDatabase = () => {
  users.length = 0
  organizations.length = 0
  products.length = 0
  orders.length = 0
}
