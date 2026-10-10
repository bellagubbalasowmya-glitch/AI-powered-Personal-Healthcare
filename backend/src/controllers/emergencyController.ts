import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getEmergencyCardFromDB,
  updateEmergencyCardInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getEmergencyCard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const card = await getEmergencyCardFromDB(userId)
    res.json({
      success: true,
      privacyNotice: 'Notice: Protected emergency medical profile. Accessible by authorized first responders.',
      data: card,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateEmergencyCard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateEmergencyCardInDB(req.body, userId)
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
