/**
 * GUIA: Boas Práticas do Projeto
 * 
 * Siga estas práticas para manter o código limpo e escalável
 */

// ✅ BOM: Usar tipos bem definidos
interface User {
  id: string
  email: string
  name: string
}

// ❌ RUIM: Usar any
// interface User {
//   id: any
//   email: any
// }

---

// ✅ BOM: Separação de responsabilidades
// services/user.service.ts
export class UserService {
  static async getUser(id: string) {
    // apenas lógica de negócio
  }
}

// app/api/users/[id]/route.ts
export async function GET(request: NextRequest) {
  // apenas roteamento e validação
  const user = await UserService.getUser(id)
  return NextResponse.json(user)
}

// ❌ RUIM: Colocar tudo na API route

---

// ✅ BOM: Path aliases para imports
import { UserService } from '@/services/auth.service'
import { User } from '@/types/index'

// ❌ RUIM: Caminhos relativos complexos
// import { UserService } from '../../../services/auth.service'

---

// ✅ BOM: Tratamento de erros consistente
try {
  const result = await someAsyncFunction()
  return NextResponse.json({ success: true, data: result })
} catch (error: any) {
  console.error('Error:', error)
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  )
}

// ❌ RUIM: Não tratar erros
// const result = await someAsyncFunction()
// return NextResponse.json(result)

---

// ✅ BOM: Validação de entrada
const email = await validateEmail(input.email)
const password = await validatePassword(input.password)

if (!email || !password) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}

// ❌ RUIM: Usar dados diretamente sem validar
// return NextResponse.json({ email: input.email })

---

// ✅ BOM: Componentes pequenos e reutilizáveis
export const Button = ({ children, variant = 'primary', ...props }) => (
  <button className={`btn-${variant}`} {...props}>
    {children}
  </button>
)

// ❌ RUIM: Componentes gigantes com múltiplas responsabilidades
// export const UserDashboard = () => { // 500+ linhas }

---

// ✅ BOM: Usar hooks para estado
export const useProducts = () => {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    // fetch produtos
  }, [])
  
  return { products }
}

// ❌ RUIM: Estado em componentes com lógica complexa

---

// ✅ BOM: Naming descritivo
const getUserEmailByOrganization = (orgId: string) => {}
const calculateOrderTotal = (items: OrderItem[]) => {}

// ❌ RUIM: Nomes genéricos
// const getData = () => {}
// const handle = () => {}

---

// ✅ BOM: Usar constantes em vez de magic numbers
const MAX_ORDERS_FREE_PLAN = 100
const JWT_EXPIRATION_DAYS = 7

// ❌ RUIM: Magic numbers espalhados
// if (orders.length > 100) { }
// jwt.sign(data, secret, { expiresIn: '7d' })

---

// ✅ BOM: Documentação inline
/**
 * Valida um coupon e retorna o desconto
 * 
 * @param code - Código do cupom (ex: SAVE10)
 * @param organizationId - ID da organização
 * @returns {discount: number, error?: string}
 */
export const validateCoupon = async (code: string, organizationId: string) => {}

// ❌ RUIM: Sem documentação
// export const validateCoupon = async (code, orgId) => {}

---

// ✅ BOM: Consistência em respostas de API
const response = {
  success: boolean
  data?: T
  error?: string
}

// ❌ RUIM: Inconsistência
// return { status: 'ok', payload: data }
// return { error: 'não funcionou' }

---

// ✅ BOM: Usar environment variables
const dbUrl = process.env.DATABASE_URL
const jwtSecret = process.env.JWT_SECRET

// ❌ RUIM: Hardcoding
// const dbUrl = 'postgresql://localhost:5432/db'

---

// ✅ BOM: Testabilidade (funções puras)
export const calculateDiscount = (price: number, discount: number) => {
  return price * (1 - discount / 100)
}

// Fácil de testar
const result = calculateDiscount(100, 10)
console.assert(result === 90)

// ❌ RUIM: Efeitos colaterais
// export const calculateDiscount = (price) => {
//   const from_db = fetch('/api/discount')
//   return price * (1 - from_db / 100)
// }

---

// ✅ BOM: DRY (Don't Repeat Yourself)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Usar em qualquer lugar
const price1 = formatCurrency(100)
const price2 = formatCurrency(50)

// ❌ RUIM: Repetir lógica
// <p>{new Intl.NumberFormat('pt-BR', {...}).format(100)}</p>
// <p>{new Intl.NumberFormat('pt-BR', {...}).format(50)}</p>

---

// ✅ BOM: Async/await em vez de callbacks
const getUser = async (id: string) => {
  const user = await db.user.findById(id)
  return user
}

// ❌ RUIM: Callback hell
// getUser(id, (err, user) => {
//   if (err) { handle(err) }
//   else { process(user) }
// })

---

// ✅ BOM: Usar optional chaining
const email = user?.email || 'no-email'

// ❌ RUIM: Verificações aninhadas
// const email = user && user.organization && user.organization.email

---

// ✅ BOM: Usar nullish coalescing
const role = input.role ?? 'user'

// ❌ RUIM: ||
// const role = input.role || 'user' // Não funciona com 0, '', false

---

// Checklist para PRs:
// ✅ Código segue o padrão de pasta
// ✅ Tipos TypeScript corretos
// ✅ Sem console.log de debug
// ✅ Sem comentários óbvios
// ✅ Função/componente com responsabilidade única
// ✅ Testado localmente
// ✅ Documentação atualizada
// ✅ Sem magic numbers
// ✅ Tratamento de erros
// ✅ Naming descritivo
