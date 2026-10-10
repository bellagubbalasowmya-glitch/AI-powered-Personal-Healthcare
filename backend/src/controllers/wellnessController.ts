import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getWellnessFromDB,
  createWellnessInDB,
  updateWellnessInDB,
  deleteWellnessFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getWellnessLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const logs = await getWellnessFromDB(userId)
    res.json({
      success: true,
      count: logs.length,
      gentleSuggestions: [
        'Circadian Regularity: Maintaining regular sleep windows supports hormone balance and cardiovascular recovery.',
        'Hydration Pacing: Spread your daily 8-glass water intake evenly through morning and early afternoon.',
        'Gentle Movement: 30-45 minutes of light cardio promotes steady insulin sensitivity.',
      ],
      data: logs,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createWellnessLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { date, sleepHours, sleepQuality, waterGlasses, waterTarget, activeMinutes, habits, moodNote } = req.body

  if (!date || sleepHours === undefined || waterGlasses === undefined) {
    res.status(400).json({
      success: false,
      error: 'Date, sleep hours, and water glasses are required.',
    })
    return
  }

  try {
    const created = await createWellnessInDB(req.body, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateWellnessLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateWellnessInDB(id, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Log entry not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteWellnessLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const deleted = await deleteWellnessFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Log entry not found' })
      return
    }
    res.json({ success: true, message: 'Wellness entry removed' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
