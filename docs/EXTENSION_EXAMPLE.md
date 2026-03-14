/**
 * EXEMPLO: Como criar um novo módulo de negócio
 * 
 * Este arquivo mostra padrões para adicionar novos recursos mantendo
 * a arquitetura limpa e escalável.
 */

// 1. DEFINIR TIPOS
// types/index.ts
export interface Coupon {
  id: string
  code: string
  discount: number // porcentagem
  organizationId: string
  maxUses: number
  currentUses: number
  createdAt: Date
}

// 2. CRIAR SERVICE
// services/coupon.service.ts
import type { Coupon } from '@/types/index'

export class CouponService {
  static async createCoupon(
    code: string,
    discount: number,
    organizationId: string,
    maxUses: number = 100
  ): Promise<Coupon> {
    if (discount < 0 || discount > 100) {
      throw new Error('Desconto deve estar entre 0 e 100')
    }

    const coupon: Coupon = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      discount,
      organizationId,
      maxUses,
      currentUses: 0,
      createdAt: new Date(),
    }

    // Salvar no banco de dados
    // await db.coupon.create(coupon)

    return coupon
  }

  static async validateCoupon(
    code: string,
    organizationId: string
  ): Promise<{ valid: boolean; discount?: number; error?: string }> {
    // Buscar coupon
    // const coupon = await db.coupon.findUnique({ code, organizationId })

    // if (!coupon) {
    //   return { valid: false, error: 'Coupon inválido' }
    // }

    // if (coupon.currentUses >= coupon.maxUses) {
    //   return { valid: false, error: 'Coupon expirado' }
    // }

    return {
      valid: true,
      discount: 10, // hardcoded para exemplo
    }
  }

  static async applyCoupon(
    code: string,
    organizationId: string
  ): Promise<void> {
    // Buscar e incrementar uso
    // const coupon = await db.coupon.findUnique({ code, organizationId })
    // await db.coupon.update(coupon.id, { currentUses: coupon.currentUses + 1 })
  }
}

// 3. CRIAR API ROUTE
// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CouponService } from '@/services/coupon.service'
import { verifyToken } from '@/lib/auth'

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
    const validation = await CouponService.validateCoupon(
      body.code,
      session.organizationId
    )

    return NextResponse.json(validation)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 4. CRIAR COMPONENTE
// components/coupons/CouponInput.tsx
'use client'

import { useState } from 'react'
import { Input, Button, FormGroup, Label } from '@/components/ui/base'
import { CouponService } from '@/services/coupon.service'

export const CouponInput = ({ onApply }: { onApply: (discount: number) => void }) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleValidate = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.valid) {
        onApply(data.discount)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao validar coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormGroup>
      <Label>Código de Desconto</Label>
      <div className='flex gap-2'>
        <Input
          type='text'
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder='Ex: SAVE10'
        />
        <Button onClick={handleValidate} disabled={loading}>
          {loading ? 'Validando...' : 'Validar'}
        </Button>
      </div>
      {error && <p className='text-red-600 text-sm mt-2'>{error}</p>}
    </FormGroup>
  )
}

// 5. USAR NO COMPONENTE PAI
// app/(app)/checkout/page.tsx
'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { CouponInput } from '@/components/coupons/CouponInput'
import { Card } from '@/components/ui/base'

export default function CheckoutPage() {
  const [discount, setDiscount] = useState(0)
  const total = 100
  const finalTotal = total * ((100 - discount) / 100)

  return (
    <AppLayout>
      <Card>
        <h2 className='text-xl font-semibold mb-4'>Checkout</h2>
        
        <CouponInput onApply={setDiscount} />

        <div className='mt-6 space-y-2 border-t pt-4'>
          <div className='flex justify-between'>
            <span>Subtotal:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className='flex justify-between text-green-600'>
              <span>Desconto ({discount}%):</span>
              <span>-R$ {(total * (discount / 100)).toFixed(2)}</span>
            </div>
          )}
          <div className='flex justify-between font-bold text-lg'>
            <span>Total:</span>
            <span>R$ {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </AppLayout>
  )
}

/**
 * RESUMO DO PADRÃO:
 * 
 * 1. Define tipos em types/index.ts
 * 2. Cria lógica em services/*.service.ts
 * 3. Expõe endpoints em app/api/*/route.ts
 * 4. Cria componentes em components/**
 * 5. Integra em páginas app/(app)/*/page.tsx
 * 
 * Este padrão garante:
 * - Reutilização de código
 * - Fácil testing
 * - Escalabilidade
 * - Manutenibilidade
 */
