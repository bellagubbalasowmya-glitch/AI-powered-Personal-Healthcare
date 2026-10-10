import { Router } from 'express'
import {
  askCopilot,
  getConversations,
  createConversation,
  deleteConversation,
  getConversationMessages,
  addConversationMessage,
} from '../controllers/copilotController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

// Conversation CRUD & Messages
router.get('/conversations', getConversations)
router.post('/conversations', createConversation)
router.delete('/conversations/:id', deleteConversation)
router.get('/conversations/:id/messages', getConversationMessages)
router.post('/conversations/:id/messages', addConversationMessage)

// Direct query compatibility for existing frontend
router.post('/query', askCopilot)

export default router
