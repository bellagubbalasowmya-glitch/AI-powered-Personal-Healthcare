import { Router } from 'express'
import { explainReport, getReportExplanations } from '../controllers/reportsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.post('/:id/explain', explainReport)
router.get('/:id/explanations', getReportExplanations)

export default router
