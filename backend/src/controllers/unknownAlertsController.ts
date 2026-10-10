import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getUnknownAlertsFromDB,
  toggleAlertReviewedInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'

export const getUnknownAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const alerts = await getUnknownAlertsFromDB(userId)
    res.json({
      success: true,
      count: alerts.length,
      safetyStandard: 'Zero Speculative Diagnoses: All ambiguous or unverified clinical entries are flagged for doctor review.',
      data: alerts,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const toggleAlertReviewed = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id)
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const updated = await toggleAlertReviewedInDB(id, userId)
    if (!updated) {
      res.status(404).json({ success: false, error: 'Alert not found' })
      return
    }
    res.json({ success: true, data: updated })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const testUncertainty = async (req: AuthRequest, res: Response): Promise<void> => {
  const { scenarioType, inputString } = req.body

  if (scenarioType === 'bp') {
    res.json({
      success: true,
      decision: {
        status: 'Needs review',
        confidenceLabel: 'Missing Baseline',
        reason: 'Isolated wrist cuff reading without documented resting period, arm elevation, or calibrated 7-day ambulatory log.',
        missingParameters: [
          'Standardized seated rest duration (5 mins)',
          'Upper arm cuff calibration index',
          'Multi-day morning/evening series',
        ],
        clinicianDiscussionRecommendation:
          'Repeat measurement using a validated upper-arm cuff after 5 minutes of seated rest before drawing conclusions.',
      },
    })
    return
  }

  if (scenarioType === 'thyroid') {
    res.json({
      success: true,
      decision: {
        status: 'Incomplete information',
        confidenceLabel: 'Ambiguous Data',
        reason: 'Reference unit is absent (μIU/mL vs mIU/L), and concurrent Free T4 and Free T3 assays are omitted.',
        missingParameters: [
          'Assay measurement unit validation',
          'Serum Free Thyroxine (FT4)',
          'Patient symptom history & pregnancy status',
        ],
        clinicianDiscussionRecommendation:
          'Request full printed laboratory panel with certified reference ranges from testing facility.',
      },
    })
    return
  }

  // Generic or low resolution scan
  res.json({
    success: true,
    decision: {
      status: 'Unable to interpret reliably',
      confidenceLabel: 'Low Confidence',
      reason: inputString
        ? `Clinical inputs "${inputString.substring(0, 50)}..." lack requisite certified diagnostic metadata.`
        : 'Optical Character Recognition (OCR) confidence score is below safety threshold (92%). Document contains illegible characters.',
      missingParameters: [
        'Legible clinician sign-off',
        'Unambiguous drug strength or assay unit',
        'Direct healthcare facility confirmation',
      ],
      clinicianDiscussionRecommendation:
        'Do NOT guess or attempt to infer medical conclusions from ambiguous data. Consult the ordering clinician directly.',
    },
  })
}
