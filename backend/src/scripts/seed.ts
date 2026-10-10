import dotenv from 'dotenv'
dotenv.config()

import { connectDB } from '../config/db.js'
import { seedSupabaseData } from '../data/supabaseRepository.js'

export const seedDatabase = async () => {
  const connected = await connectDB()
  if (!connected) {
    console.log('[Seed] Supabase PostgreSQL not connected. Seed script skipped.')
    return
  }

  await seedSupabaseData()
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase().then(() => process.exit(0))
}
