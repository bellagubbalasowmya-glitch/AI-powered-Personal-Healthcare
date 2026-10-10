import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { getRecordsFromDB, saveMedicalSummaryInDB, DatabaseError } from '../data/supabaseRepository.js'
import { aiService } from '../services/aiService.js'
import { memoryStore } from '../data/store.js'

export const getHealthSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    // Try fetching records from DB, fallback to memoryStore if DB is offline
    let records: any[] = []
    try {
      records = await getRecordsFromDB(userId)
    } catch {
      records = memoryStore.records
    }

    if (!records || records.length === 0) {
      records = memoryStore.records
    }

    // Extract all outside-reference-range analytes and all valid analytes
    const flaggedAnalytes: any[] = []
    const normalAnalytes: any[] = []
    const allMedications: any[] = []

    records.forEach((rec) => {
      if (Array.isArray(rec.extractedFields)) {
        rec.extractedFields.forEach((field: any) => {
          if (field.status === 'Outside Reference Range' || field.status === 'Needs Review') {
            flaggedAnalytes.push({
              sourceRecord: rec.name,
              date: rec.recordDate,
              testName: field.testName,
              value: field.value,
              unit: field.unit,
              referenceRange: field.referenceRange,
              status: field.status,
              category: field.category,
              notes: field.interpretationNotes,
            })
          } else {
            normalAnalytes.push({
              sourceRecord: rec.name,
              date: rec.recordDate,
              testName: field.testName,
              value: field.value,
              unit: field.unit,
              status: field.status,
            })
          }
        })
      }
      if (Array.isArray(rec.medications)) {
        rec.medications.forEach((med: any) => {
          allMedications.push(med)
        })
      }
    })

    const hasAnyAnalytes = flaggedAnalytes.length > 0 || normalAnalytes.length > 0

    let plainLanguageSummary = ''
    let teluguSummary = ''

    if (!hasAnyAnalytes) {
      plainLanguageSummary = 'No laboratory results could be extracted. Please upload a readable medical report.'
      teluguSummary = 'ఎటువంటి ప్రయోగశాల ఫలితాలు కనుగొనబడలేదు. దయచేసి చదవగలిగే వైద్య నివేదికను అప్‌లోడ్ చేయండి.'
    } else {
      plainLanguageSummary = `HealthTwin AI digital twin has synthesized ${records.length} diagnostic document${records.length > 1 ? 's' : ''} containing ${flaggedAnalytes.length + normalAnalytes.length} extracted laboratory parameters.`
      if (flaggedAnalytes.length > 0) {
        const flaggedList = flaggedAnalytes.map((a) => `${a.testName} (${a.value} ${a.unit || ''})`).join(', ')
        plainLanguageSummary += ` Attention: ${flaggedAnalytes.length} parameter${flaggedAnalytes.length > 1 ? 's are' : ' is'} outside standard reference intervals: ${flaggedList}.`
      } else {
        plainLanguageSummary += ' All evaluated laboratory parameters are within normal reference intervals.'
      }

      teluguSummary = `హెల్త్‌ట్విన్ AI ద్వారా మీ నివేదికలు విశ్లేషించబడ్డాయి. మొత్తం ${flaggedAnalytes.length + normalAnalytes.length} ప్రయోగశాల పరీక్షల ఫలితాలు ధృవీకరించబడ్డాయి.`
      if (flaggedAnalytes.length > 0) {
        teluguSummary += ` వీటిలో ${flaggedAnalytes.length} పరీక్షల ఫలితాలు సాధారణ పరిమితి కంటే భిన్నంగా ఉన్నాయి. మీ వైద్యునితో చర్చించండి.`
      } else {
        teluguSummary += ' అన్ని పరీక్షల ఫలితాలు సాధారణ పరిధిలోనే ఉన్నాయి.'
      }
    }

    const summaryPayload = {
      isSyntheticSummary: false,
      generatedAt: new Date().toISOString(),
      patientName: req.user?.name || 'Alex Morgan',
      patientId: req.user?.patientId || 'SYN-PT-89420',
      totalRecordsAnalyzed: records.length,
      plainLanguageExecutiveSummary: plainLanguageSummary,
      teluguExecutiveSummary: teluguSummary,
      flaggedAnalytes,
      activeMedicationsCount: allMedications.length,
      systemObservations: flaggedAnalytes.map((a) => ({
        system: a.category || 'General Laboratory',
        status: 'Needs Review',
        finding: `${a.testName}: ${a.value} ${a.unit || ''} (Reference: ${a.referenceRange || 'Standard limits'}).`,
        recommendation: `Review ${a.testName} result with your physician during your next consult.`,
      })),
      clinicianDiscussionChecklist: flaggedAnalytes.map(
        (a) => `What follow-up assessment is advised for my ${a.testName} level of ${a.value} ${a.unit || ''}?`
      ),
      safetyNotice:
        'Clinical Ethics Notice: HealthTwin AI plain-language summaries are generated from structured lab extracts to empower informed patient-doctor communication. They do not substitute for formal clinical diagnosis or prescriptive medical instructions.',
    }


    res.json({
      success: true,
      data: summaryPayload,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const generateSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const records = await getRecordsFromDB(userId)
    const summary = await aiService.generateSummary({
      patientName: req.user?.name || 'Alex Morgan',
      patientId: req.user?.patientId || 'SYN-PT-89420',
      records: records.map((r: any) => ({
        title: r.name,
        documentDate: r.recordDate,
        recordType: r.category,
        summary: r.summary,
        extractedFields: r.extractedFields,
      })),
    })

    const recordIds = records.map((r: any) => r.id).filter(Boolean)
    await saveMedicalSummaryInDB(userId, {
      title: 'Digital Health Twin Longitudinal Summary',
      summary_text: summary.summaryText,
      source_record_ids: recordIds,
      summary_type: 'comprehensive',
      model_provider: summary.modelProvider,
      model_name: summary.modelName,
    })

    res.json({
      success: true,
      data: summary,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
