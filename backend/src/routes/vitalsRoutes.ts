import { Router } from 'express'
import { getVitals, createVital, deleteVital } from '../controllers/vitalsController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getVitals)
router.post('/', createVital)
router.delete('/:id', deleteVital)

export default router
