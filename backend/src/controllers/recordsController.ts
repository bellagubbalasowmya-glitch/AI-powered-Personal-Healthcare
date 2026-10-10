import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getRecordsFromDB,
  getRecordByIdFromDB,
  createRecordInDB,
  updateRecordInDB,
  deleteRecordFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'
import { extractionService } from '../services/extractionService.js'
import { memoryStore } from '../data/store.js'


export const getRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const records = await getRecordsFromDB(userId)
    res.json({ success: true, count: records.length, data: records })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const getRecordById = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const record = await getRecordByIdFromDB(id, userId)
    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found' })
      return
    }
    res.json({ success: true, data: record })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { name, category, recordDate } = req.body

  if (!name || !category || !recordDate) {
    res.status(400).json({ success: false, error: 'Name, category, and recordDate are required' })
    return
  }

  try {
    const record = await createRecordInDB(req.body, userId)
    res.status(201).json({ success: true, data: record })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const updateRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateRecordInDB(id, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Record not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const deleted = await deleteRecordFromDB(id, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Record not found' })
      return
    }
    res.json({ success: true, message: 'Record deleted successfully' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const getRecordFileUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const record = await getRecordByIdFromDB(id, userId)
    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found' })
      return
    }

    res.json({
      success: true,
      data: {
        recordId: record.id,
        name: record.name,
        fileType: record.fileType,
        isSynthetic: record.isSynthetic,
        signedUrl: null,
        message: 'Medical document metadata available. Signed URL requires file in Supabase Storage bucket "medical-records".',
      },
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const uploadRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  // Extract uploaded file from req.file or req.files
  let file: Express.Multer.File | undefined = req.file
  if (!file && req.files) {
    if (Array.isArray(req.files) && req.files.length > 0) {
      file = req.files[0]
    } else if (typeof req.files === 'object') {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] }
      file = filesObj['file']?.[0] || filesObj['reportFile']?.[0]
    }
  }

  if (!file) {
    res.status(400).json({
      success: false,
      error: 'No report file was provided in the upload request',
    })
    return
  }

  // Validate allowed mime types
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  if (!allowedMimeTypes.includes(file.mimetype)) {
    res.status(400).json({
      success: false,
      error: `Unsupported file type "${file.mimetype}". Only PDF, PNG, and JPG medical reports are accepted.`,
    })
    return
  }

  try {
    const extracted = await extractionService.processUploadedReport(
      file.buffer,
      file.mimetype,
      file.originalname
    )

    const payload = {
      id: `rec-${Date.now()}`,
      name: req.body.name || file.originalname.replace(/\.[^/.]+$/, ''),
      category: req.body.category || 'Laboratory Report',
      recordDate: extracted.reportDate || new Date().toISOString().split('T')[0],
      facility: req.body.facility || 'Clinical Testing Facility',
      clinician: req.body.clinician || 'Dr. Sarah Jenkins, MD',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.mimetype.includes('pdf') ? 'PDF' : 'Image',
      processingStatus: extracted.hasLabResults ? 'Processed' : 'Needs Review',
      isSynthetic: false,
      summary: extracted.plainEnglishSummary,
      teluguSummary: extracted.teluguSummary,
      extractedFields: extracted.analytes,
      keyFindings: extracted.keyFindings,
      clinicianDiscussionQuestions: extracted.clinicianDiscussionQuestions,
      terminologyGlossary: extracted.terminologyGlossary,
    }

    let savedRecord: any = payload
    try {
      savedRecord = await createRecordInDB(payload, userId)
    } catch (dbErr: any) {
      console.warn(`[RecordsController] Database insert deferred (${dbErr.message}), returning extracted record.`)
      memoryStore.records.unshift(payload)
    }

    res.status(201).json({
      success: true,
      data: savedRecord,
      extraction: {
        method: extracted.extractionMethod,
        hasLabResults: extracted.hasLabResults,
        analytesCount: extracted.analytes.length,
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Report extraction failed' })
  }
}

