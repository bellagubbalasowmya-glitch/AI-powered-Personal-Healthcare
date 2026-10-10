import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getExplainersFromDB,
  createExplainerInDB,
  updateAnalyteCorrectionInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'
import { extractionService } from '../services/extractionService.js'

export const getExplainerDocs = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const docs = await getExplainersFromDB(userId)
    res.json({ success: true, count: docs.length, data: docs })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const uploadAndExplainReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const file = req.file
  const body = req.body

  const fileName = file ? file.originalname : body.fileName || 'Uploaded_Medical_Report.pdf'
  const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : body.fileSize || '1.2 MB'
  const uploadDate = new Date().toISOString().split('T')[0]

  let analytes: any[] = []
  let plainEnglishSummary = ''
  let teluguSummary = ''
  let terminology: any[] = []
  let extractionStatus = 'Complete'

  if (file && file.buffer) {
    try {
      const extracted = await extractionService.processUploadedReport(
        file.buffer,
        file.mimetype,
        file.originalname
      )
      analytes = extracted.analytes
      plainEnglishSummary = extracted.plainEnglishSummary
      teluguSummary = extracted.teluguSummary
      terminology = extracted.terminologyGlossary.map((t) => ({
        term: t.term,
        english: t.definition,
        telugu: t.teluguDefinition || '',
      }))
      extractionStatus = extracted.hasLabResults ? 'Complete' : 'Needs Review'
    } catch (err: any) {
      console.warn('[ExplainerController] Real extraction failed, using fallback:', err.message)
    }
  }

  // Fallback if no file buffer was passed (e.g. mock request from client)
  if (analytes.length === 0 && !file) {
    analytes = [
      {
        id: `an-${Date.now()}-1`,
        testName: 'Fasting Blood Glucose',
        value: 106,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'Outside Reference Range',
        category: 'Metabolic',
        interpretationNotes: 'Fasting reading slightly above standard 99 mg/dL upper threshold.',
        teluguExplanation: 'ఉపవాస రక్త చక్కెర సాధారణ పరిమితి 70-99 కంటే కొద్దిగా ఎక్కువగా 106 mg/dL ఉంది.',
      },
      {
        id: `an-${Date.now()}-2`,
        testName: 'Serum Creatinine',
        value: 0.9,
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.1 mg/dL',
        status: 'Within Reference Range',
        category: 'Renal',
        interpretationNotes: 'Normal renal filtration efficiency.',
        teluguExplanation: 'సీరం క్రియాటినిన్ సాధారణ పరిధిలో ఉంది, కిడ్నీల పనితీరు బాగుంది.',
      },
    ]
    plainEnglishSummary = `Simulated report parsing complete for "${fileName}". Review extracted analytes below.`
    teluguSummary = `"${fileName}" పరిశీలన పూర్తయింది. దయచేసి వివరాలను సరిచూసుకోండి.`
    terminology = [
      {
        term: 'Fasting Blood Glucose',
        english: 'Blood sugar level measured after not eating for at least 8 to 12 hours.',
        telugu: 'కనీసం 8-12 గంటలు ఆహారం తీసుకోకుండా పరీక్షించే రక్త చక్కెర స్థాయి.',
      },
    ]
  }

  const newDoc = {
    fileName,
    fileSize,
    uploadDate,
    category: body.category || 'Biochemical Panel',
    extractionStatus,
    analytes,
    plainEnglishSummary: plainEnglishSummary || 'No laboratory results could be extracted. Please upload a readable medical report.',
    teluguSummary: teluguSummary || 'ఎటువంటి ప్రయోగశాల ఫలితాలు కనుగొనబడలేదు. దయచేసి చదవగలిగే వైద్య నివేదికను అప్‌లోడ్ చేయండి.',
    terminology,
    isDemoSimulation: !file,
  }

  try {
    const created = await createExplainerInDB(newDoc, userId)
    res.status(201).json({ success: true, data: created })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}


export const updateAnalyteCorrection = async (req: AuthRequest, res: Response): Promise<void> => {
  const docId = String(req.params.docId)
  const analyteId = String(req.params.analyteId)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await updateAnalyteCorrectionInDB(docId, analyteId, req.body, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Document or analyte not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
