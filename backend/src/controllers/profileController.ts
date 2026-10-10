import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getProfileFromDB,
  updateProfileInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const profile = await getProfileFromDB(userId)
    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' })
      return
    }
    res.json({ success: true, data: profile })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateProfileInDB(userId, req.body)
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
