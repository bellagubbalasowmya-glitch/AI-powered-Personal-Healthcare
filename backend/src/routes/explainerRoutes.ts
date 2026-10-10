import { Router } from 'express'
import {
  getExplainerDocs,
  uploadAndExplainReport,
  updateAnalyteCorrection,
} from '../controllers/explainerController.js'
import { authenticate } from '../middleware/auth.js'
import { uploadReport } from '../middleware/upload.js'

const router = Router()

router.use(authenticate)

router.get('/', getExplainerDocs)
router.post('/upload', uploadReport.single('reportFile'), uploadAndExplainReport)
router.put('/:docId/analytes/:analyteId', updateAnalyteCorrection)

export default router
