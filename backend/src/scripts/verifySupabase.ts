import dotenv from 'dotenv'
dotenv.config()

import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const { Client } = pg

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

console.log('====================================================')
console.log('  HealthTwin AI - Supabase Database Verification    ')
console.log('====================================================\n')

// 1. Inspect Environment Configuration
console.log('[1/5] Inspecting Configuration...')

let hasUrl = Boolean(url)
let hasServiceKey = Boolean(serviceKey)
let hasDirectUrl = Boolean(directUrl)

let maskedHost = 'not-configured'
if (url) {
  try {
    maskedHost = new URL(url).hostname
  } catch {}
} else if (directUrl) {
  try {
    maskedHost = new URL(directUrl).hostname
  } catch {}
}

console.log(`  Supabase URL configured:       ${hasUrl ? 'PASS' : 'FAIL (Missing SUPABASE_URL in backend/.env)'}`)
console.log(`  Service Role Key detected:     ${hasServiceKey ? 'PASS' : 'FAIL (Missing SUPABASE_SERVICE_ROLE_KEY in backend/.env)'}`)
console.log(`  Direct PostgreSQL URI detected: ${hasDirectUrl ? 'PASS' : 'FAIL (Missing DIRECT_URL in backend/.env)'}`)
console.log(`  Target Database Host:          ${maskedHost}`)

if (!hasDirectUrl && (!hasUrl || !hasServiceKey)) {
  console.log('\n❌ Status: NOT CONNECTED')
  console.log('Error: Neither direct PostgreSQL credentials nor Supabase API keys are fully configured.')
  console.log('\nSteps to resolve:')
  console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard')
  console.log('2. Project Settings -> API: Copy "Project URL" and "service_role" secret key into backend/.env')
  console.log('3. Project Settings -> Database: Copy "Connection string" (URI) into backend/.env')
  process.exit(1)
}

const REQUIRED_TABLES = [
  'profiles',
  'medical_records',
  'health_metrics',
  'medications',
  'appointments',
  'reminders',
  'medical_summaries',
  'copilot_conversations',
  'copilot_messages',
  'wellness_entries',
  'health_alerts',
  'report_explanations',
  'emergency_cards',
  'user_consents',
  'audit_logs',
]

async function runVerification() {
  let dbReachable = false
  let existingTables: string[] = []
  let rlsEnabledTables: string[] = []
  let hasStorageBucket = false

  // 2. Test Real Database Connectivity
  console.log('\n[2/5] Testing Live Database Connectivity...')

  if (hasDirectUrl) {
    const client = new Client({
      connectionString: directUrl,
      ssl: { rejectUnauthorized: false },
    })

    try {
      await client.connect()
      dbReachable = true
      const dbInfo = await client.query('SELECT current_database(), current_user, version()')
      console.log('  ✓ PASS: Successfully established real TCP connection to PostgreSQL engine!')
      console.log(`    Database: ${dbInfo.rows[0].current_database} | User: ${dbInfo.rows[0].current_user}`)

      // Query tables in public schema
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `)
      existingTables = tablesRes.rows.map((r: any) => r.table_name)

      // Query RLS status
      const rlsRes = await client.query(`
        SELECT relname as table_name, relrowsecurity as rls_enabled 
        FROM pg_class 
        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
        WHERE pg_namespace.nspname = 'public' AND pg_class.relkind = 'r' AND relrowsecurity = true;
      `)
      rlsEnabledTables = rlsRes.rows.map((r: any) => r.table_name)

      // Query storage buckets
      const bucketRes = await client.query(`
        SELECT id, name, public FROM storage.buckets WHERE name = 'medical-records';
      `).catch(() => ({ rows: [] }))
      hasStorageBucket = bucketRes.rows.length > 0

      await client.end()
    } catch (err: any) {
      console.log(`  ✗ Direct PostgreSQL connection failed: ${err.message}`)
      await client.end().catch(() => {})
    }
  }

  // Fallback to Supabase JS client if available
  if (!dbReachable && hasUrl && hasServiceKey) {
    try {
      const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false } })
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      if (!error) {
        dbReachable = true
        console.log('  ✓ PASS: Successfully connected to Supabase via PostgREST client!')
      } else {
        console.log(`  ✗ Supabase API request returned error: ${error.message}`)
      }
    } catch (err: any) {
      console.log(`  ✗ Supabase API connection failed: ${err.message}`)
    }
  }

  // 3. Inspect Required Schema Tables
  console.log('\n[3/5] Inspecting Relational Schema Tables...')
  console.log(`  Found ${existingTables.length} tables in public schema.`)

  const missingTables = REQUIRED_TABLES.filter((t) => !existingTables.includes(t))

  if (missingTables.length === 0 && REQUIRED_TABLES.length > 0) {
    console.log('  ✓ PASS: All 15 required relational tables exist and are ready!')
  } else {
    console.log(`  ✗ FAIL: Missing ${missingTables.length} required tables:`)
    missingTables.forEach((t) => console.log(`    - ${t}`))
  }

  // 4. Verify Row Level Security (RLS)
  console.log('\n[4/5] Checking Row Level Security (RLS) & Isolation...')
  if (existingTables.length > 0) {
    console.log(`  Tables with RLS Enabled: ${rlsEnabledTables.length}/${existingTables.length}`)
    if (rlsEnabledTables.length === existingTables.length) {
      console.log('  ✓ PASS: Row Level Security is active on user-owned tables.')
    } else {
      console.log('  ⚠ WARNING: Some public tables do not have RLS enabled.')
    }
  } else {
    console.log('  - NOT VERIFIED: Cannot verify RLS policies because tables have not been created yet.')
  }

  // 5. Check Storage Bucket
  console.log('\n[5/5] Checking Private Storage Bucket (`medical-records`)...')
  if (hasStorageBucket) {
    console.log('  ✓ PASS: Private storage bucket "medical-records" is present.')
  } else {
    console.log('  ✗ FAIL: Storage bucket "medical-records" does not exist yet.')
  }

  // Final Summary & Exit
  console.log('\n====================================================')
  if (dbReachable && missingTables.length === 0) {
    console.log('  OVERALL STATUS: CONNECTED (Fully Verified)')
    console.log('====================================================\n')
    process.exit(0)
  } else if (dbReachable && missingTables.length > 0) {
    console.log('  OVERALL STATUS: PARTIALLY CONNECTED')
    console.log('  (Database engine reachable, but migration has not been applied yet)')
    console.log('====================================================')
    console.log('\nExact Next Steps:')
    console.log('1. Open your Supabase SQL Editor: https://supabase.com/dashboard/project/zeyuqvzqtbqwpumzvjxv/sql')
    console.log('2. Paste and run the migration file: supabase/migrations/001_initial_schema.sql')
    console.log('3. Re-run: npm run verify-db\n')
    process.exit(1)
  } else {
    console.log('  OVERALL STATUS: NOT CONNECTED')
    console.log('====================================================\n')
    process.exit(1)
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err)
  process.exit(1)
})
