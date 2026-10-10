import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middleware/auth.js'
import {
  findProfileByEmail,
  createProfile,
  DatabaseError,
} from '../data/supabaseRepository.js'
import { DEMO_USER_UUID, isSupabaseConfigured } from '../config/supabase.js'
import { DEMO_USER } from '../data/seedData.js'

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' })
    return
  }

  // Demo user quick login
  if (email === DEMO_USER.email) {
    const token = jwt.sign(
      { id: DEMO_USER_UUID, email: DEMO_USER.email, name: DEMO_USER.name, patientId: DEMO_USER.patientId },
      process.env.JWT_SECRET || 'healthtwin_super_secret_jwt_key_2026_dev',
      { expiresIn: '7d' }
    )
    res.json({
      success: true,
      token,
      user: { ...DEMO_USER, id: DEMO_USER_UUID },
    })
    return
  }

  if (!isSupabaseConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Database unavailable: Supabase PostgreSQL is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env',
    })
    return
  }

  try {
    const profile = await findProfileByEmail(email)
    if (!profile) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, name: profile.name, patientId: profile.patient_id },
      process.env.JWT_SECRET || 'healthtwin_super_secret_jwt_key_2026_dev',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        patientId: profile.patient_id,
        role: profile.role,
      },
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    return
  }

  if (!isSupabaseConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Database unavailable: Supabase PostgreSQL is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env',
    })
    return
  }

  try {
    const existing = await findProfileByEmail(email)
    if (existing) {
      res.status(400).json({ success: false, error: 'User with this email already exists' })
      return
    }

    const patientId = `SYN-PT-${Math.floor(10000 + Math.random() * 90000)}`
    const profile = await createProfile({
      name,
      email: email.toLowerCase().trim(),
      patient_id: patientId,
      role: 'patient',
    })

    const token = jwt.sign(
      { id: profile.id, email: profile.email, name: profile.name, patientId },
      process.env.JWT_SECRET || 'healthtwin_super_secret_jwt_key_2026_dev',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      token,
      user: { id: profile.id, name, email, patientId },
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    user: req.user,
  })
}
