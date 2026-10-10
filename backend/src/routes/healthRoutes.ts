import { Router } from 'express'
import { getDBStatus } from '../config/db.js'

const router = Router()

router.get('/', (req, res) => {
  const dbStatus = getDBStatus()
  res.json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    service: 'HealthTwin AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    activeModules: [
      'medical-records',
      'health-summary',
      'health-timeline',
      'medicine-reminders',
      'health-vitals',
      'appointments',
      'wellness-tracker',
      'emergency-card',
      'report-explainer',
      'unknown-condition-alerts',
      'ask-health-copilot',
    ],
    mode: 'live',
    safetyNotice: 'HealthTwin AI secure digital twin active.',
  })
})

export default router
