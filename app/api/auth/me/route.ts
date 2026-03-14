import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { UserService, OrganizationService } from '@/services/auth.service'

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const session = verifyToken(token)
    if (!session) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const user = await UserService.getUserById(session.userId)
    const organization = await OrganizationService.getOrganizationById(session.organizationId)

    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Usuário ou organização não encontrados' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        plan: organization.plan,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao verificar sessão' },
      { status: 500 }
    )
  }
}
