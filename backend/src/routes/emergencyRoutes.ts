import { Router } from 'express'
import { getEmergencyCard, updateEmergencyCard } from '../controllers/emergencyController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getEmergencyCard)
router.patch('/', updateEmergencyCard)
router.put('/', updateEmergencyCard)

export default router
