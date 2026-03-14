# Troubleshooting - Guia de Resolução de Problemas

## 🔧 Problemas Comuns

### 1. Erro: "Cannot find module"

**Problema**: Importações falhando

**Solução**:
```bash
# Verificar path alias no tsconfig.json
# Verificar se o arquivo existe
# Limpar cache
rm -rf .next node_modules/.cache
npm run dev
```

---

### 2. Erro: "TypeScript errors"

**Problema**: Type-checking falhando

**Solução**:
```bash
# Verificar tipos
npm run type-check

# Se tiver 'any' types, corrigir:
// ❌ EVITAR
const user: any = data

// ✅ USAR
interface User {
  id: string
  name: string
}
const user: User = data
```

---

### 3. Erro: "JWT token inválido"

**Problema**: Token expirado ou inválido

**Solução**:
```typescript
// Verificar se token está sendo enviado
const token = localStorage.getItem('authToken')
console.log('[v0] Token:', token) // Debug

// Verificar expiração
const decoded = jwt.decode(token)
console.log('[v0] Expiration:', decoded.expiresAt)

// Se expirado, fazer login novamente
```

---

### 4. Erro: "CORS blocked"

**Problema**: Cross-Origin requests falhando

**Solução**:
```typescript
// next.config.js - já configurado
headers: async () => {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Content-Type', value: 'application/json' }
    ]
  }]
}
```

---

### 5. Erro: "Banco de dados não encontrado"

**Problema**: Mock database vazio

**Solução**:
```typescript
// Para desenvolvimento, banco em memória
// Para produção, usar Prisma + Neon
// Ver: docs/DATABASE_MIGRATION.md

// Verificar dados
import { users, organizations } from '@/database/mock'
console.log('[v0] Users:', users)
console.log('[v0] Organizations:', organizations)
```

---

### 6. Erro: "Build falhando"

**Problema**: Erro ao fazer build

**Solução**:
```bash
# Verificar erros
npm run type-check
npm run lint

# Limpar cache
rm -rf .next
npm run build

# Se persistir, verificar logs
npm run build 2>&1 | head -50
```

---

### 7. Erro: "Tailwind CSS não aplicando"

**Problema**: Estilos não aparecem

**Solução**:
```javascript
// tailwind.config.js - verificar content
content: [
  './app/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
  './modules/**/*.{js,ts,jsx,tsx}',
],

// Limpar cache
rm -rf .next
npm run dev
```

---

### 8. Erro: "500 Internal Server Error"

**Problema**: API retornando erro

**Solução**:
```typescript
// Adicionar logs de debug
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Request:', request)
    const body = await request.json()
    console.log('[v0] Body:', body)
    
    // ... lógica
    
  } catch (error) {
    console.log('[v0] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Verificar no console do Next.js
```

---

### 9. Erro: "Componente não renderizando"

**Problema**: Página em branco

**Solução**:
```typescript
// Verificar imports
import { Component } from '@/components/Component'

// Verificar se é 'use client'
'use client'

// Adicionar error boundary
// Verificar console do navegador
console.log('[v0] Component rendered')

// Se async, usar Suspense
import { Suspense } from 'react'
<Suspense fallback={<p>Carregando...</p>}>
  <Component />
</Suspense>
```

---

### 10. Erro: "Password hash incorreto"

**Problema**: Senha não bate

**Solução**:
```typescript
// Verificar hash
import { hashPassword, comparePasswords } from '@/lib/password'

const hash = await hashPassword('senha123')
const isValid = await comparePasswords('senha123', hash)
console.log('[v0] Hash válido:', isValid)

// Sempre usar comparePasswords, nunca comparar strings
```

---

## 📊 Debug Tips

### 1. Adicionar logs de debug
```typescript
console.log('[v0] Variable:', variable)
console.log('[v0] Step reached')
console.log('[v0] Error:', error.message)
```

### 2. Verificar network
```javascript
// DevTools > Network Tab
// Verificar requests/responses das APIs
```

### 3. Verificar estado
```typescript
// React DevTools
// Verificar props e estado dos componentes
```

### 4. Verificar tipos
```bash
npm run type-check
```

### 5. Usar debugger
```typescript
export async function GET() {
  debugger; // Parar aqui no debugger
  // ... resto do código
}
```

---

## 🆘 Se nada funcionar

1. **Limpar tudo**
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

2. **Verificar versões**
```bash
node --version  # Deve ser 18+
npm --version
```

3. **Verificar porta**
```bash
# Se 3000 já está em uso
lsof -i :3000
kill -9 <PID>

# Ou usar outra porta
npm run dev -- -p 3001
```

4. **Verificar environment**
```bash
# .env.local deve existir
ls -la .env.local

# Com variáveis necessárias
echo "DATABASE_URL=..." >> .env.local
echo "JWT_SECRET=..." >> .env.local
```

5. **Abrir issue**
Se nada funcionar, verificar:
- Stack trace completo
- Passos para reproduzir
- Versões (Node, npm, packages)
- Sistema operacional

---

## 📞 Contato para Suporte

- **Documentação**: Verificar ARCHITECTURE.md
- **Exemplos**: Ver docs/EXTENSION_EXAMPLE.md
- **Boas Práticas**: docs/BEST_PRACTICES.md

---

## ✅ Checklist de Diagnóstico

- [ ] Node.js 18+ instalado
- [ ] npm install executado sem erros
- [ ] npm run dev funciona
- [ ] http://localhost:3000 carrega
- [ ] Conseguir acessar /login e /register
- [ ] Console do navegador sem erros
- [ ] Console do Next.js sem erros críticos
- [ ] TypeScript type-check passando
- [ ] Banco de dados mock tendo dados
- [ ] Tokens JWT sendo gerados

Se todos os itens estão OK, seu projeto está funcionando corretamente!
