import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const DEMO_USER_UUID = 'd3b07384-d113-469a-a8fe-89241951f38e'

let supabaseInstance: SupabaseClient | null = null
let connectionTested = false
let connectionSuccessful = false
let lastConnectionError: string | null = null

/**
 * Validates whether a string is a standard RFC 4122 UUID
 */
export const isValidUUID = (id?: string): boolean => {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Resolves a request user ID into a valid PostgreSQL UUID.
 * Maps legacy synthetic demo identifiers ('user-alex-morgan-89420') to DEMO_USER_UUID.
 */
export const resolveUserUUID = (userId?: string): string => {
  if (!userId) return DEMO_USER_UUID
  if (isValidUUID(userId)) return userId
  if (userId === 'user-alex-morgan-89420' || userId.includes('alex-morgan')) {
    return DEMO_USER_UUID
  }
  // Fallback to demo UUID for demonstration integrity
  return DEMO_USER_UUID
}

/**
 * Returns the initialized Supabase client or null if environment variables are missing
 */
export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase environment variables missing. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'
    )
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseInstance
}

import pg from 'pg'
const { Pool } = pg

let pgPool: pg.Pool | null = null

export const getPgPool = (): pg.Pool => {
  if (pgPool) return pgPool
  const connString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connString) throw new Error('No DIRECT_URL or DATABASE_URL found in environment')
  pgPool = new Pool({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  })
  return pgPool
}

/**
 * Checks if Supabase REST API credentials are configured in environment variables
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export const isPostgresConfigured = (): boolean => {
  return Boolean(process.env.DIRECT_URL || process.env.DATABASE_URL)
}

export const isDatabaseConfigured = (): boolean => {
  return isSupabaseConfigured() || isPostgresConfigured()
}

/**
 * Tests the real connection to Supabase PostgreSQL by querying public.profiles
 */
export const testSupabaseConnection = async (): Promise<{
  connected: boolean
  error?: string
  projectHost?: string
}> => {
  if (!isDatabaseConfigured()) {
    connectionTested = true
    connectionSuccessful = false
    lastConnectionError = 'SUPABASE_URL or DATABASE_URL not configured in backend/.env'
    return { connected: false, error: lastConnectionError }
  }

  // 1. Try Direct PostgreSQL Connection first if available
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (directUrl) {
    try {
      const pool = getPgPool()
      const { rows } = await pool.query('SELECT id, patient_id, full_name FROM public.profiles LIMIT 1;')
      connectionTested = true
      connectionSuccessful = true
      lastConnectionError = null

      let projectHost = 'aws-0-ap-northeast-2.pooler.supabase.com'
      try {
        projectHost = new URL(directUrl).hostname
      } catch {}

      console.log(`[Database] Supabase PostgreSQL connected via pooler (${projectHost}). Found ${rows.length} profile(s).`)
      return { connected: true, projectHost }
    } catch (err: any) {
      console.warn(`[Database] Direct PostgreSQL check: ${err.message}`)
      lastConnectionError = err.message
    }
  }

  // 2. Try Supabase JS client
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('profiles').select('id, full_name, patient_id').limit(1)

      if (error) {
        connectionTested = true
        connectionSuccessful = false
        lastConnectionError = error.message
        console.warn(`[Database] Supabase query returned error: ${error.message}`)
        return { connected: false, error: error.message }
      }

      connectionTested = true
      connectionSuccessful = true
      lastConnectionError = null

      let projectHost = 'supabase-postgresql'
      try {
        projectHost = new URL(process.env.SUPABASE_URL!).hostname
      } catch {}

      console.log(`[Database] Supabase PostgreSQL connected successfully (${projectHost}).`)
      return { connected: true, projectHost }
    } catch (err: any) {
      connectionTested = true
      connectionSuccessful = false
      lastConnectionError = err.message
      console.warn(`[Database] Supabase connection failed: ${err.message}`)
      return { connected: false, error: err.message }
    }
  }

  connectionTested = true
  connectionSuccessful = false
  return { connected: false, error: lastConnectionError || 'Connection check failed' }
}

/**
 * Returns sanitized connection status for health checks
 */
export const getSupabaseStatus = () => {
  const configured = isDatabaseConfigured()
  let maskedHost = 'not-configured'

  const connString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (connString) {
    try {
      maskedHost = new URL(connString).hostname
    } catch {}
  } else if (process.env.SUPABASE_URL) {
    try {
      const url = new URL(process.env.SUPABASE_URL)
      maskedHost = url.hostname
    } catch {
      maskedHost = 'invalid-url'
    }
  }

  return {
    configured,
    connected: connectionSuccessful,
    tested: connectionTested,
    provider: 'supabase-postgresql',
    host: maskedHost,
    error: lastConnectionError,
  }
}
