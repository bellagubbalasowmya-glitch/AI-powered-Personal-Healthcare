import { Router } from 'express'
import {
  getUnknownAlerts,
  toggleAlertReviewed,
  testUncertainty,
} from '../controllers/unknownAlertsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getUnknownAlerts)
router.patch('/:id/toggle-review', toggleAlertReviewed)
router.post('/test', testUncertainty)

export default router
