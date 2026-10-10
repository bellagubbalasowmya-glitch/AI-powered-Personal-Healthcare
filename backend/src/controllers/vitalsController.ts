import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getVitalsFromDB,
  createVitalInDB,
  deleteVitalFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getVitals = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const vitals = await getVitalsFromDB(userId)
    res.json({ success: true, count: vitals.length, data: vitals })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createVital = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const {
    date,
    time,
    systolic,
    diastolic,
    pulse,
    temperature,
    temperatureUnit,
    oxygenSaturation,
    notes,
  } = req.body

  if (!date || !systolic || !diastolic || !pulse || !temperature || !oxygenSaturation) {
    res.status(400).json({
      success: false,
      error: 'Date, systolic, diastolic, pulse, temperature, and oxygen saturation are required.',
    })
    return
  }

  // Non-diagnostic cautious alert generation
  let cautiousAlert: string | undefined
  let isCautious = false

  const sys = Number(systolic)
  const dia = Number(diastolic)
  const spo2 = Number(oxygenSaturation)

  if (sys >= 140 || dia >= 90) {
    cautiousAlert = `Informational Note: Systolic (${sys} mmHg) or Diastolic (${dia} mmHg) logged above standard resting thresholds. Recommend resting quietly for 5 minutes and re-measuring using a validated arm cuff.`
    isCautious = true
  } else if (spo2 < 95) {
    cautiousAlert = `Informational Note: SpO2 measurement (${spo2}%) noted below standard ambient threshold (>95%). Verify sensor placement and warmth of fingertip.`
    isCautious = true
  }

  const payload = {
    date,
    time: time || '08:00 AM',
    systolic: sys,
    diastolic: dia,
    pulse: Number(pulse),
    temperature: Number(temperature),
    temperatureUnit: temperatureUnit || '°F',
    oxygenSaturation: spo2,
    notes: notes || '',
    cautiousAlert,
    isCautious,
  }

  try {
    const created = await createVitalInDB(payload, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteVital = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const deleted = await deleteVitalFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Vital entry not found' })
      return
    }
    res.json({ success: true, message: 'Vital measurement removed' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
