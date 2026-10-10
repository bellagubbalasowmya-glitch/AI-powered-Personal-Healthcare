import { Router } from 'express'
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from '../controllers/medicationsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getMedications)
router.post('/', createMedication)
router.patch('/:id', updateMedication)
router.put('/:id', updateMedication)
router.delete('/:id', deleteMedication)

export default router
