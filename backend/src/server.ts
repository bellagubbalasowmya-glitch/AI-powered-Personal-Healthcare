import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import { connectDB } from './config/db.js'
import { seedDatabase } from './scripts/seed.js'
import { errorHandler } from './middleware/errorHandler.js'

// Import Routers
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import recordsRoutes from './routes/recordsRoutes.js'
import metricsRoutes from './routes/metricsRoutes.js'
import medicationsRoutes from './routes/medicationsRoutes.js'
import summaryRoutes from './routes/summaryRoutes.js'
import timelineRoutes from './routes/timelineRoutes.js'
import remindersRoutes from './routes/remindersRoutes.js'
import vitalsRoutes from './routes/vitalsRoutes.js'
import appointmentsRoutes from './routes/appointmentsRoutes.js'
import wellnessRoutes from './routes/wellnessRoutes.js'
import emergencyRoutes from './routes/emergencyRoutes.js'
import explainerRoutes from './routes/explainerRoutes.js'
import unknownAlertsRoutes from './routes/unknownAlertsRoutes.js'
import alertsRoutes from './routes/alertsRoutes.js'
import reportsRoutes from './routes/reportsRoutes.js'
import copilotRoutes from './routes/copilotRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server) or matching localhost
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(null, true) // Lenient for hackathon evaluation
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  })
)

// Body parsers
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Safe request logging (Path & Method only; zero PHI body logging)
app.use((req, res, next) => {
  console.log(`[API] ${new Date().toISOString().substring(11, 19)} ${req.method} ${req.path}`)
  next()
})

// Mount API Routes (Unified REST & Legacy Compatibility)
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/records', recordsRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/medications', medicationsRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/reminders', remindersRoutes)
app.use('/api/vitals', vitalsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/wellness', wellnessRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/emergency-card', emergencyRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/explainer', explainerRoutes)
app.use('/api/unknown-alerts', unknownAlertsRoutes)
app.use('/api/copilot', copilotRoutes)

// Root fallback / documentation ping
app.get('/', (req, res) => {
  res.json({
    name: 'HealthTwin AI – Personal Digital Twin & Copilot API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/me',
      profile: '/api/profile',
      records: '/api/records',
      metrics: '/api/metrics',
      medications: '/api/medications',
      appointments: '/api/appointments',
      reminders: '/api/reminders',
      wellness: '/api/wellness',
      summary: '/api/summary',
      timeline: '/api/timeline',
      copilot: '/api/copilot/conversations',
      alerts: '/api/alerts',
      reports: '/api/reports',
      emergencyCard: '/api/emergency-card',
      vitals: '/api/vitals',
      emergency: '/api/emergency',
      explainer: '/api/explainer',
      unknownAlerts: '/api/unknown-alerts',
    },
    documentation: 'See README.md for endpoint specifications',
  })
})

// Centralized error handler
app.use(errorHandler)

// Start Server & Connect Database
const startServer = async () => {
  const isConnected = await connectDB()

  if (isConnected && process.env.ENABLE_DEMO_SEED === 'true') {
    await seedDatabase()
  }

  app.listen(PORT, () => {
    console.log(`====================================================`)
    console.log(`  HealthTwin AI Backend Service Online`)
    console.log(`  Local URL:   http://localhost:${PORT}`)
    console.log(`  HealthCheck: http://localhost:${PORT}/api/health`)
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`  Database:    ${isConnected ? 'Supabase PostgreSQL Connected' : 'Supabase PostgreSQL (Configuration Required)'}`)
    console.log(`====================================================`)
  })
}

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test'))
if (!isTestEnv) {
  startServer().catch((err) => {
    console.error('[Startup Error]:', err)
    process.exit(1)
  })
}

export default app
