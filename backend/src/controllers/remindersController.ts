import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getRemindersFromDB,
  createReminderInDB,
  updateReminderInDB,
  deleteReminderFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const reminders = await getRemindersFromDB(userId)
    res.json({ success: true, count: reminders.length, data: reminders })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { medicineName, prescribedDosage, startDate } = req.body

  // Healthcare Safety Rule: Never auto-generate dosages
  if (!medicineName || !prescribedDosage || !startDate) {
    res.status(400).json({
      success: false,
      error: 'Medicine name, clinician-prescribed dosage, and start date are mandatory.',
    })
    return
  }

  try {
    const created = await createReminderInDB(req.body, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateReminderInDB(id, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Reminder not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const deleted = await deleteReminderFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Reminder not found' })
      return
    }
    res.json({ success: true, message: 'Reminder deleted successfully' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const completeReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateReminderInDB(id, { status: 'Taken', isCompleted: true }, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Reminder not found' })
      return
    }
    res.json({ success: true, message: 'Reminder marked as completed', data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
