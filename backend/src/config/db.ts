import {
  testSupabaseConnection,
  getSupabaseStatus,
  isDatabaseConfigured,
} from './supabase.js'

let isConnected = false

export const connectDB = async (): Promise<boolean> => {
  if (!isDatabaseConfigured()) {
    isConnected = false
    console.warn(`[Database] Neither Supabase API nor PostgreSQL URL is configured in backend/.env.`)
    console.warn(`[Database] Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect your PostgreSQL database.`)
    return false
  }

  const result = await testSupabaseConnection()
  isConnected = result.connected
  return isConnected
}

export const getDBStatus = () => {
  const status = getSupabaseStatus()
  return {
    connected: status.connected,
    state: status.connected ? 'connected' : 'disconnected',
    provider: 'supabase-postgresql',
    configured: status.configured,
    host: status.host,
    database: 'postgres (Supabase)',
    error: status.error || undefined,
  }
}
