import { Router } from 'express'
import { getHealthSummary, generateSummary } from '../controllers/summaryController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)
router.get('/', getHealthSummary)
router.post('/generate', generateSummary)

export default router
