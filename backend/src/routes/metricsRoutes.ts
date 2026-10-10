import { Router } from 'express'
import {
  getMetrics,
  getMetricById,
  createMetric,
  updateMetric,
  deleteMetric,
} from '../controllers/metricsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getMetrics)
router.post('/', createMetric)
router.get('/:id', getMetricById)
router.patch('/:id', updateMetric)
router.put('/:id', updateMetric)
router.delete('/:id', deleteMetric)

export default router
