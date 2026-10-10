import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getHealthAlertsFromDB,
  acknowledgeHealthAlertInDB,
  resolveHealthAlertInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const alerts = await getHealthAlertsFromDB(userId)
    res.json({ success: true, count: alerts.length, data: alerts })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const acknowledgeAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const updated = await acknowledgeHealthAlertInDB(id, userId)
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const resolveAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const updated = await resolveHealthAlertInDB(id, userId)
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
