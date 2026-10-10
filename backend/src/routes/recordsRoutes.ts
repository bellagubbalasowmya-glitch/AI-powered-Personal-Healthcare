import { Router } from 'express'
import {
  getRecords,
  getRecordById,
  createRecord,
  uploadRecord,
  updateRecord,
  deleteRecord,
  getRecordFileUrl,
} from '../controllers/recordsController.js'
import { authenticate } from '../middleware/auth.js'
import { uploadReport } from '../middleware/upload.js'

const router = Router()

router.use(authenticate)

router.get('/', getRecords)
router.get('/:id', getRecordById)
router.get('/:id/file-url', getRecordFileUrl)
router.post('/upload', uploadReport.fields([{ name: 'file', maxCount: 1 }, { name: 'reportFile', maxCount: 1 }]), uploadRecord)
router.post('/', createRecord)
router.patch('/:id', updateRecord)
router.put('/:id', updateRecord)
router.delete('/:id', deleteRecord)

export default router

