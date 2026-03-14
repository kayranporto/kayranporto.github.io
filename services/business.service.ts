import { products, orders } from '@/database/mock'
import { PLAN_LIMITS } from '@/config/pricing'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  organizationId: string
  createdAt: Date
}

export interface Order {
  id: string
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  organizationId: string
  items: OrderItem[]
  createdAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export class ProductService {
  static async createProduct(
    name: string,
    price: number,
    organizationId: string,
    description?: string
  ): Promise<Product> {
    const product: Product = {
      id: Date.now().toString(),
      name,
      description,
      price,
      organizationId,
      createdAt: new Date(),
    }

    products.push(product)
    return product
  }

  static async getProductsByOrganization(organizationId: string): Promise<Product[]> {
    return products.filter(p => p.organizationId === organizationId)
  }

  static async getProductById(id: string): Promise<Product | null> {
    return products.find(p => p.id === id) || null
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return false

    products.splice(index, 1)
    return true
  }
}

export class OrderService {
  static async createOrder(
    organizationId: string,
    items: OrderItem[]
  ): Promise<Order> {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const order: Order = {
      id: Date.now().toString(),
      total,
      status: 'pending',
      organizationId,
      items,
      createdAt: new Date(),
    }

    orders.push(order)
    return order
  }

  static async getOrdersByOrganization(
    organizationId: string,
    limit: number = 50
  ): Promise<Order[]> {
    return orders
      .filter(o => o.organizationId === organizationId)
      .slice(-limit)
      .reverse()
  }

  static async getOrderById(id: string): Promise<Order | null> {
    return orders.find(o => o.id === id) || null
  }

  static async updateOrderStatus(
    id: string,
    status: 'completed' | 'cancelled'
  ): Promise<Order | null> {
    const order = orders.find(o => o.id === id)
    if (!order) return null

    order.status = status
    return order
  }

  static canCreateOrder(organizationPlan: string, currentOrderCount: number): boolean {
    const limit = PLAN_LIMITS[organizationPlan as any]?.maxOrders
    return limit === -1 || currentOrderCount < limit
  }
}
