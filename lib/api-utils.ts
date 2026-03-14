'use client'

export interface ApiRequest {
  userId?: string
  organizationId?: string
  role?: string
}

export interface ApiErrorResponse {
  error: string
  statusCode: number
  timestamp: string
}

export const createApiErrorResponse = (
  error: string,
  statusCode: number
): ApiErrorResponse => ({
  error,
  statusCode,
  timestamp: new Date().toISOString(),
})

export const withErrorHandling = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error: any) {
      console.error('[API Error]', error)
      throw error
    }
  }
}

export const validateRequest = (request: ApiRequest, required: string[] = []): boolean => {
  return required.every(key => (request as any)[key] !== undefined)
}
