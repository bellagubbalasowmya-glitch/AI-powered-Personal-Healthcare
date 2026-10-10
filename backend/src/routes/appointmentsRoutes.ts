import { Router } from 'express'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getAppointments)
router.post('/', createAppointment)
router.patch('/:id', updateAppointment)
router.put('/:id', updateAppointment)
router.delete('/:id', deleteAppointment)

export default router
