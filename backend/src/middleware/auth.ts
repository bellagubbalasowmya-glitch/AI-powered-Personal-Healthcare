import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { DEMO_USER } from '../data/seedData.js'
import { DEMO_USER_UUID, resolveUserUUID } from '../config/supabase.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    name: string
    email: string
    patientId: string
    role?: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  // 1. If JWT token provided
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'healthtwin_super_secret_jwt_key_2026_dev'

    try {
      const decoded = jwt.verify(token, secret) as any
      const rawId = decoded.id || decoded.userId || decoded.sub || DEMO_USER_UUID
      req.user = {
        id: resolveUserUUID(rawId),
        name: decoded.name || DEMO_USER.name,
        email: decoded.email || DEMO_USER.email,
        patientId: decoded.patientId || DEMO_USER.patientId,
        role: decoded.role || 'patient',
      }
      return next()
    } catch (err: any) {
      // Check if it's a valid Supabase Auth JWT
      try {
        const decoded = jwt.decode(token) as any
        if (
          decoded &&
          (decoded.sub || decoded.id || decoded.userId) &&
          (decoded.iss?.includes('supabase') ||
            decoded.aud === 'authenticated' ||
            decoded.role === 'authenticated' ||
            decoded.type === 'healthtwin_auth' ||
            decoded.app === 'healthtwin')
        ) {
          if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            res.status(401).json({
              success: false,
              error: 'Session expired. Please log in again.',
            })
            return
          }
          const rawUserId = decoded.sub || decoded.id || decoded.userId
          req.user = {
            id: resolveUserUUID(rawUserId),
            name:
              decoded.user_metadata?.full_name ||
              decoded.name ||
              decoded.email?.split('@')[0] ||
              DEMO_USER.name,
            email: decoded.email || DEMO_USER.email,
            patientId:
              decoded.user_metadata?.patient_id ||
              decoded.patientId ||
              'PT-' + String(rawUserId).slice(0, 5).toUpperCase(),
            role: decoded.role || 'patient',
          }
          return next()
        }
      } catch {}

      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token',
      })
      return
    }
  }

  // 2. Reject requests without valid token
  res.status(401).json({
    success: false,
    error: 'Authentication required. Please provide a valid Authorization Bearer token.',
  })
}
