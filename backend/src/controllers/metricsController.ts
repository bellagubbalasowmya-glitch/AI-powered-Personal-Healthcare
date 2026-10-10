import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getMetricsFromDB,
  getMetricByIdFromDB,
  createMetricInDB,
  updateMetricInDB,
  deleteMetricFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const metricType = req.query.type as string | undefined

  try {
    const metrics = await getMetricsFromDB(userId, metricType)
    res.json({ success: true, count: metrics.length, data: metrics })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const getMetricById = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const metric = await getMetricByIdFromDB(id, userId)
    if (!metric) {
      res.status(404).json({ success: false, error: 'Health metric observation not found' })
      return
    }
    res.json({ success: true, data: metric })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createMetric = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { metric_type, metricType } = req.body

  if (!metric_type && !metricType) {
    res.status(400).json({ success: false, error: 'Metric type is required (e.g., blood_pressure, heart_rate, blood_glucose)' })
    return
  }

  try {
    const created = await createMetricInDB(req.body, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateMetric = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const updated = await updateMetricInDB(id, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Health metric observation not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteMetric = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const id = String(req.params.id)

  try {
    const deleted = await deleteMetricFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Health metric observation not found' })
      return
    }
    res.json({ success: true, message: 'Health metric observation deleted successfully' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
