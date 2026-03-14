/**
 * GUIA: Migrar para Banco de Dados Real
 * 
 * Este guia mostra como passar de dados em memória para um BD real.
 */

// ANTES: database/mock.ts
// export const users: User[] = []
// export const orders: Order[] = []

// DEPOIS: Usar Prisma com Neon

/**
 * PASSO 1: Instalar Prisma
 * 
 * npm install @prisma/client
 * npm install -D @prisma/cli
 */

/**
 * PASSO 2: Criar arquivo .env.local
 * 
 * DATABASE_URL="postgresql://user:password@neon.tech/imperio_delivery"
 * NEXT_PUBLIC_API_URL="http://localhost:3000"
 */

/**
 * PASSO 3: Criar schema Prisma (database/schema.prisma)
 * 
 * datasource db {
 *   provider = "postgresql"
 *   url      = env("DATABASE_URL")
 * }
 * 
 * generator client {
 *   provider = "prisma-client-js"
 * }
 * 
 * model User {
 *   id        String   @id @default(cuid())
 *   email     String   @unique
 *   name      String
 *   password  String
 *   role      String   @default("user")
 *   status    String   @default("active")
 *   organizationId String
 *   organization Organization @relation(fields: [organizationId], references: [id])
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * }
 */

/**
 * PASSO 4: Executar migrations
 * 
 * npx prisma migrate dev --name init
 */

/**
 * PASSO 5: Usar Prisma nos Services
 */

// ANTES
// import { users } from '@/database/mock'
// 
// export class UserService {
//   static async getUserById(id: string) {
//     return users.find(u => u.id === id)
//   }
// }

// DEPOIS
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class UserService {
  static async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  static async createUser(
    email: string,
    name: string,
    password: string,
    organizationId: string
  ) {
    return prisma.user.create({
      data: { email, name, password, organizationId },
    })
  }

  static async getUsersByOrganization(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
    })
  }
}

/**
 * PASSO 6: Testar
 * 
 * npm run dev
 * # Testar endpoints
 */

/**
 * PROVIDERS RECOMENDADOS:
 * 
 * 1. Neon (PostgreSQL) - Recomendado
 *    - URL: https://neon.tech
 *    - Grátis: 0.5 CPU, 1GB RAM, 3GB storage
 *    - Escalável
 * 
 * 2. Supabase (PostgreSQL + Auth)
 *    - URL: https://supabase.com
 *    - Inclui autenticação pronta
 *    - REST API automática
 * 
 * 3. PlanetScale (MySQL)
 *    - URL: https://planetscale.com
 *    - Git workflow para schemas
 *    - Grátis: 5GB storage
 */
