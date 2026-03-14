import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/services/business.service'
import { verifyToken } from '@/lib/auth'

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const session = verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const orders = await OrderService.getOrdersByOrganization(session.organizationId)

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const session = verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const order = await OrderService.createOrder(session.organizationId, body.items)

    return NextResponse.json({
      success: true,
      data: order,
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
