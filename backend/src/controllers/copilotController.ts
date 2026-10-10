import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  getRecordsFromDB,
  getConversationsFromDB,
  createConversationInDB,
  deleteConversationInDB,
  getMessagesFromDB,
  createMessageInDB,
  DatabaseError,
} from '../data/supabaseRepository.js'
import { aiService } from '../services/aiService.js'

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'

  try {
    const convs = await getConversationsFromDB(userId)
    res.json({ success: true, count: convs.length, data: convs })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const title = req.body.title || 'Health Copilot Consultation'

  try {
    const conv = await createConversationInDB(userId, title)
    res.status(201).json({ success: true, data: conv })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const conversationId = String(req.params.id)

  try {
    const deleted = await deleteConversationInDB(conversationId, userId)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Conversation not found' })
      return
    }
    res.json({ success: true, message: 'Conversation deleted successfully' })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const getConversationMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const conversationId = String(req.params.id)

  try {
    const messages = await getMessagesFromDB(conversationId, userId)
    res.json({ success: true, count: messages.length, data: messages })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const addConversationMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const conversationId = String(req.params.id)
  const { content, role = 'user' } = req.body

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ success: false, error: 'Message content is required' })
    return
  }

  try {
    // 1. Save user message
    const userMsg = await createMessageInDB(
      conversationId,
      {
        role,
        content: content.trim(),
      },
      userId
    )

    // 2. Fetch patient records for context
    const records = await getRecordsFromDB(userId)

    // 3. Generate grounded answer
    const aiResponse = await aiService.answerQuestion({
      question: content.trim(),
      patientName: req.user?.name || 'Alex Morgan',
      patientId: req.user?.patientId || 'SYN-PT-89420',
      records,
    })

    // 4. Save assistant response
    const assistantMsg = await createMessageInDB(
      conversationId,
      {
        role: 'assistant',
        content: aiResponse.answer,
        model_provider: aiResponse.modelProvider,
        model_name: 'healthtwin-bounded-rules',
      },
      userId
    )

    res.status(201).json({
      success: true,
      data: {
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        citations: aiResponse.citations,
        suggestedFollowUps: aiResponse.suggestedFollowUps,
        disclaimer: aiResponse.disclaimer,
      },
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}

export const askCopilot = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'd3b07384-d113-469a-a8fe-89241951f38e'
  const { question } = req.body

  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ success: false, error: 'A valid health inquiry question is required' })
    return
  }

  const query = question.toLowerCase().trim()
  const isPrescriptionQuery =
    query.includes('how much should i take') ||
    query.includes('prescribe') ||
    query.includes('change my dose') ||
    query.includes('what medicine should i take')

  if (isPrescriptionQuery) {
    res.json({
      success: true,
      answer:
        'Safety Boundary Alert: HealthTwin AI cannot prescribe medications, adjust dosage strengths, or recommend pharmaceutical therapies. Please consult your prescribing clinician or pharmacist to adjust any prescription.',
      citations: ['Clinical Safety Protocol: Prescription Boundary'],
      suggestedFollowUps: [
        'What medications are currently recorded in my file?',
        'When is my next doctor appointment?',
      ],
      isClinicallyBounded: true,
      disclaimer: 'Notice: HealthTwin AI answers strictly from recorded documents and does not provide prescriptive advice.',
      modelProvider: 'clinical-safety-guardrail',
    })
    return
  }

  try {
    let records: any[] = []
    try {
      records = await getRecordsFromDB(userId)
    } catch (dbErr: any) {
      if (dbErr instanceof DatabaseError) {
        res.status(dbErr.statusCode).json({
          success: false,
          error: dbErr.message,
        })
        return
      }
      throw dbErr
    }

    const result = await aiService.answerQuestion({
      question: question.trim(),
      patientName: req.user?.name || 'Alex Morgan',
      patientId: req.user?.patientId || 'SYN-PT-89420',
      records,
    })

    res.json({
      success: true,
      ...result,
    })
  } catch (err: any) {
    const status = err instanceof DatabaseError ? err.statusCode : 500
    res.status(status).json({ success: false, error: err.message })
  }
}
