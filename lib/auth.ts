import jwt from 'jsonwebtoken'
import type { AuthSession } from '@/types/index'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
const JWT_EXPIRATION = '7d'

export const generateToken = (session: AuthSession): string => {
  return jwt.sign(session, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  })
}

export const verifyToken = (token: string): AuthSession | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as AuthSession
  } catch {
    return null
  }
}

export const decodeToken = (token: string): any | null => {
  try {
    return jwt.decode(token)
  } catch {
    return null
  }
}
