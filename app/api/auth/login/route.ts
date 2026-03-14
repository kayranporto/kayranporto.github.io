import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { generateToken } from '@/lib/auth'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const session = await AuthService.login(email, password)
    if (!session) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const token = generateToken(session)

    // Para obter dados completos do usuário e organização
    // seria necessário queries ao banco de dados
    // Aqui estamos retornando dados básicos

    const response = NextResponse.json(
      {
        token,
        user: {
          id: session.userId,
          role: session.role,
        },
        organization: {
          id: session.organizationId,
        },
      },
      { status: 200 }
    )

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
