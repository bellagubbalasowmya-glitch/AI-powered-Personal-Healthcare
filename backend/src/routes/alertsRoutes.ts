import { Router } from 'express'
import { getAlerts, acknowledgeAlert, resolveAlert } from '../controllers/alertsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getAlerts)
router.post('/:id/acknowledge', acknowledgeAlert)
router.post('/:id/resolve', resolveAlert)

export default router
