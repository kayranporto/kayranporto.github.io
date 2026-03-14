import { NextRequest, NextResponse } from 'next/server'
import { AuthService, UserService, OrganizationService } from '@/services/auth.service'
import { generateToken, verifyToken } from '@/lib/auth'
import { validatePassword } from '@/lib/password'

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, organizationName } = body

    // Validações
    if (!email || !password || !name || !organizationName) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    const result = await AuthService.register(email, password, name, organizationName)
    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao registrar usuário' },
        { status: 400 }
      )
    }

    const token = generateToken(result.session)

    const response = NextResponse.json(
      {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          plan: result.organization.plan,
        },
      },
      { status: 201 }
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
      { error: error.message },
      { status: 500 }
    )
  }
}
