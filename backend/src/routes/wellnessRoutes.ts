import { Router } from 'express'
import {
  getWellnessLogs,
  createWellnessLog,
  updateWellnessLog,
  deleteWellnessLog,
} from '../controllers/wellnessController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getWellnessLogs)
router.post('/', createWellnessLog)
router.patch('/:id', updateWellnessLog)
router.put('/:id', updateWellnessLog)
router.delete('/:id', deleteWellnessLog)

export default router
