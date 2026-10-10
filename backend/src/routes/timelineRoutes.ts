import { Router } from 'express'
import { getTimeline, createTimelineEvent } from '../controllers/timelineController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)
router.get('/', getTimeline)
router.post('/', createTimelineEvent)

export default router
