import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getAppointmentsFromDB,
  createAppointmentInDB,
  updateAppointmentInDB,
  deleteAppointmentFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { filter } = req.query as { filter?: string }

  try {
    const appointments = await getAppointmentsFromDB(userId, filter)
    res.json({
      success: true,
      count: appointments.length,
      demoNotice: 'Notice: Displayed appointments are demonstration bookings within HealthTwin AI.',
      data: appointments,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { doctorName, date, time, reason } = req.body

  if (!doctorName || !date || !time || !reason) {
    res.status(400).json({
      success: false,
      error: 'Doctor name, date, time, and reason for consultation are required.',
    })
    return
  }

  try {
    const created = await createAppointmentInDB(req.body, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateAppointmentInDB(id, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Appointment not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const deleted = await deleteAppointmentFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Appointment not found' })
      return
    }
    res.json({ success: true, message: 'Appointment deleted successfully' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
