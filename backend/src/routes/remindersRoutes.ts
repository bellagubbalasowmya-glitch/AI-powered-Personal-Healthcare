import { Router } from 'express'
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
} from '../controllers/remindersController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getReminders)
router.post('/', createReminder)
router.patch('/:id', updateReminder)
router.put('/:id', updateReminder)
router.delete('/:id', deleteReminder)
router.post('/:id/complete', completeReminder)

export default router
