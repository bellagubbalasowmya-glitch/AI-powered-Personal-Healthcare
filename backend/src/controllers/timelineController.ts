import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getTimelineFromDB,
  createTimelineEventInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const events = await getTimelineFromDB(userId)
    res.json({ success: true, count: events.length, data: events })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createTimelineEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { title, date } = req.body

  if (!title || !date) {
    res.status(400).json({ success: false, error: 'Title and date are required' })
    return
  }

  try {
    const created = await createTimelineEventInDB(req.body, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
