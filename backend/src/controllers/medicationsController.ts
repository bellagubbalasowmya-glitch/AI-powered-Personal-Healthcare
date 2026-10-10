import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getMedicationsFromDB,
  createMedicationInDB,
  updateMedicationInDB,
  deleteMedicationFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getMedications = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const meds = await getMedicationsFromDB(userId)
    res.json({ success: true, count: meds.length, data: meds })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { medication_name, medicationName, dosage } = req.body

  if (!medication_name && !medicationName) {
    res.status(400).json({ success: false, error: 'Medication name is required.' })
    return
  }
  if (!dosage) {
    res.status(400).json({ success: false, error: 'Prescribed dosage strength is required.' })
    return
  }

  try {
    const created = await createMedicationInDB(req.body, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const updated = await updateMedicationInDB(id, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Medication entry not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteMedication = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const deleted = await deleteMedicationFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Medication entry not found' })
      return
    }
    res.json({ success: true, message: 'Medication entry deleted successfully' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
