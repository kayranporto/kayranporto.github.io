# Arquitetura SaaS - Império Delivery

## 📋 Visão Geral

Este é um projeto SaaS escalável e pronto para produção, construído com **Next.js 16**, **TypeScript**, **Tailwind CSS** e seguindo as melhores práticas de arquitetura moderna.

## 🏗️ Estrutura de Pastas

```
/imperio-delivery-saas
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                    # Grupo de rotas da aplicação
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   └── pricing/page.tsx
│   ├── api/                      # Rotas da API
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── me/route.ts
│   │   ├── orders/route.ts
│   │   └── products/route.ts
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                    # Componentes reutilizáveis
│   ├── ui/
│   │   └── base.tsx              # Componentes base (Button, Input, etc)
│   └── layout/
│       ├── Navigation.tsx        # Header, Sidebar, Footer
│       └── AppLayout.tsx         # Layouts principales
│
├── modules/                       # Módulos de negócio (expansível)
│   ├── delivery/                 # Domínio de Delivery
│   ├── payments/                 # Domínio de Pagamentos
│   └── reports/                  # Domínio de Relatórios
│
├── services/                      # Lógica de negócio
│   ├── auth.service.ts           # Autenticação e usuários
│   └── business.service.ts       # Pedidos e produtos
│
├── lib/                           # Utilidades compartilhadas
│   ├── auth.ts                   # JWT e tokens
│   ├── password.ts               # Hash e validação
│   ├── utils.ts                  # Funções utilitárias
│   ├── api-client.ts             # Cliente HTTP
│   └── api-utils.ts              # Utilities da API
│
├── hooks/                         # React Hooks customizados
│   └── useAuth.ts                # Hook de autenticação
│
├── types/                         # TypeScript interfaces
│   └── index.ts                  # Tipos principais
│
├── config/                        # Configurações
│   └── pricing.ts                # Configuração de planos
│
├── database/                      # Camada de dados
│   ├── mock.ts                   # Mock para desenvolvimento
│   └── schema.prisma.example     # Exemplo de schema para produção
│
├── globals.css                    # Estilos globais
├── tailwind.config.js             # Configuração Tailwind
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
├── package.json
└── .env.example                   # Exemplo de variáveis
```

## 🔐 Arquitetura de Autenticação

### Fluxo de Login

1. **Registro**: Usuário cria conta com email, senha e organização
2. **Hash de Senha**: Senha é hasheada com bcryptjs
3. **JWT Token**: Gerado token JWT com sessão
4. **HTTP Cookie**: Token armazenado em cookie seguro (httpOnly)
5. **LocalStorage**: Token também armazenado no client para requisições

### Segurança

- Senhas hasheadas com bcryptjs (salt: 10 rounds)
- Validação de força de senha (8+ chars, maiúscula, número, especial)
- JWT com expiração de 7 dias
- Cookies HTTP-only para prevenir XSS
- Proteção CSRF em requisições

## 🏢 Multi-Tenancy

Cada organização tem:
- Usuários isolados
- Produtos separados
- Pedidos independentes
- Dados completamente isolados

```typescript
// Exemplo de isolamento
const orders = orders.filter(o => o.organizationId === session.organizationId)
```

## 💰 Sistema de Planos e Limites

### Planos Disponíveis

```typescript
{
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
    maxOrders: -1,           // Ilimitado
    maxUsers: -1,
    maxProducts: -1,
    storageGB: -1,
    apiCallsPerDay: -1,
  },
}
```

### Validação de Limites

```typescript
const canCreate = checkPlanLimit(organization.plan, 'maxOrders', currentCount)
if (!canCreate) {
  throw new Error('Limite de pedidos atingido')
}
```

## 🚀 API REST

### Endpoints

#### Autenticação
- `POST /api/auth/register` - Criar nova conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados da sessão atual

#### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto

#### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido

### Padrão de Resposta

```typescript
{
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Autenticação em Requisições

```typescript
// Header obrigatório
Authorization: Bearer {JWT_TOKEN}
```

## 🏗️ Padrões Arquiteturais

### Separação de Responsabilidades

1. **API Routes** - Apenas roteamento e validação
2. **Services** - Lógica de negócio
3. **Database** - Persistência de dados
4. **Components** - Apresentação (UI)
5. **Hooks** - Estado e efeitos

### Exemplo de Fluxo

```
User Input (Component)
      ↓
API Client (lib/api-client.ts)
      ↓
API Route (app/api/...)
      ↓
Service Layer (services/...)
      ↓
Database (database/...)
      ↓
Response
```

## 📈 Escalabilidade

### Como Escalar

#### 1. **Banco de Dados**
```bash
# Instalar Prisma
npm install @prisma/client @prisma/cli

# Configurar Neon ou outro provider
# database/schema.prisma.example → database/schema.prisma
# npm run db:migrate
```

#### 2. **Cache**
```typescript
// Adicionar Redis com Upstash
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})
```

#### 3. **Fila de Processamento**
```typescript
// Usar Vercel Queues ou Bull
// Para processar pedidos em background
```

#### 4. **CDN e Static Generation**
```typescript
// app/api/products/route.ts
export const revalidate = 3600 // Cache por 1 hora
```

#### 5. **Monitoramento**
```typescript
// Integrar Sentry
import * as Sentry from "@sentry/nextjs"
```

## 🔄 Próximos Passos para Produção

### 1. Integração com Banco de Dados Real
```bash
# Neon (PostgreSQL)
npm install @neondatabase/serverless
# ou
# Supabase (PostgreSQL + Auth)
npm install @supabase/supabase-js
```

### 2. Pagamentos
```typescript
// Integrar Stripe
npm install stripe @stripe/stripe-js
```

### 3. Email
```typescript
// Integrar SendGrid ou Resend
npm install @sendgrid/mail
// ou
npm install resend
```

### 4. Storage
```typescript
// Vercel Blob para uploads
npm install @vercel/blob
```

### 5. Autenticação Avançada
```typescript
// Auth.js para OAuth
npm install next-auth
```

### 6. Observabilidade
```typescript
// Sentry para erros
npm install @sentry/nextjs
```

## 🧪 Exemplo: Criar Novo Recurso

### Passo 1: Definir Tipo
```typescript
// types/index.ts
export interface Invoice {
  id: string
  organizationId: string
  amount: number
  status: 'draft' | 'sent' | 'paid'
}
```

### Passo 2: Criar Service
```typescript
// services/invoice.service.ts
export class InvoiceService {
  static async createInvoice(organizationId: string, amount: number) {
    // lógica...
  }
}
```

### Passo 3: Criar API Route
```typescript
// app/api/invoices/route.ts
export async function POST(request: NextRequest) {
  const session = verifyToken(token)
  const invoice = await InvoiceService.createInvoice(session.organizationId, amount)
  return NextResponse.json(invoice)
}
```

### Passo 4: Criar Página
```typescript
// app/(app)/invoices/page.tsx
export default function InvoicesPage() {
  const invoices = useApi('/api/invoices')
  return <AppLayout>{/* render invoices */}</AppLayout>
}
```

## 💡 Boas Práticas Implementadas

- ✅ TypeScript em 100% do código
- ✅ Componentes reutilizáveis
- ✅ Separação de responsabilidades
- ✅ Validação de entrada
- ✅ Tratamento de erros
- ✅ Autenticação segura
- ✅ Multi-tenancy
- ✅ Documentação inline
- ✅ Path aliases (@/)
- ✅ Tailwind CSS (3-5 cores)

## 📚 Recursos Adicionais

- [Next.js Docs](https://nextjs.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Neon Database](https://neon.tech)
- [Prisma ORM](https://www.prisma.io)

## 🤝 Contribuindo

Este é um projeto de exemplo. Para adicionar novas features:

1. Criar branch: `git checkout -b feature/nova-feature`
2. Implementar seguindo os padrões
3. Testar (adicionar testes unitários)
4. Fazer commit: `git commit -m 'Add nova feature'`
5. Push: `git push origin feature/nova-feature`
6. Abrir PR

---

**Desenvolvido com ❤️ para ser escalável e profissional**
