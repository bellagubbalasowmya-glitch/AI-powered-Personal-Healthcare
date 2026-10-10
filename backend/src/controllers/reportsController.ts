import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getRecordByIdFromDB,
  createReportExplanationInDB,
  getReportExplanationsFromDB,
  DatabaseError,
} from '../data/supabaseRepository.js'
import { aiService } from '../services/aiService.js'

export const explainReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const recordId = String(req.params.id)

  try {
    const record = await getRecordByIdFromDB(recordId, userId)
    if (!record) {
      res.status(404).json({ success: false, error: 'Medical report not found' })
      return
    }

    const explanation = await aiService.explainReport({
      reportTitle: record.name,
      recordType: record.category,
      extractedText: record.summary,
      analytes: record.extractedFields,
    })

    const saved = await createReportExplanationInDB(
      record.id,
      {
        title: `Explanation: ${record.name}`,
        fileName: `${record.name.replace(/\s+/g, '_')}.pdf`,
        explanationText: explanation.plainEnglishSummary,
        teluguExplanation: explanation.teluguSummary,
        analytes: record.extractedFields || [],
        terminology: explanation.terminology,
      },
      userId
    )

    res.json({
      success: true,
      data: {
        recordId: record.id,
        recordName: record.name,
        explanation: saved,
      },
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const getReportExplanations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const recordId = String(req.params.id)

  try {
    const explanations = await getReportExplanationsFromDB(recordId, userId)
    res.json({
      success: true,
      count: explanations.length,
      data: explanations,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
