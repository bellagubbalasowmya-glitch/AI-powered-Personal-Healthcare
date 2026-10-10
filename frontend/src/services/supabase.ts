import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://zeyuqvzqtbqwpumzvjxv.supabase.co'

// Read standard anon key or publishable key, ignoring legacy placeholder
const rawAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''

const supabaseAnonKey =
  rawAnonKey === 'sb_publishable_vWVLVbAjpv1fJ-_nPLOEag_0usXD26UI' ? '' : rawAnonKey

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 10)
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-anon-key-configure-in-env',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
)

export interface UserProfile {
  id: string
  auth_user_id?: string
  patient_id?: string
  full_name: string
  email?: string
  date_of_birth?: string
  blood_group?: string
  preferred_name?: string
  role?: string
}

/**
 * Sign up a new user with Supabase Auth and initialize user metadata
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}`,
    },
  })

  if (error) throw error

  // If session immediately granted (e.g. email confirmation off), ensure profile created
  if (data.user) {
    try {
      await ensureUserProfile(data.user.id, fullName, email)
    } catch (profileErr) {
      console.warn('Profile creation deferred:', profileErr)
    }
  }

  return data
}

/**
 * Sign in existing user with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  if (data.user) {
    const fullName = data.user.user_metadata?.full_name || email.split('@')[0]
    await ensureUserProfile(data.user.id, fullName, email).catch(() => {})
  }

  return data
}

/**
 * Sign out user and clear local session state
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  localStorage.removeItem('healthtwin_auth_token')
  localStorage.removeItem('healthtwin_remember_me')
  if (error) throw error
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}#reset-password`,
  })
  if (error) throw error
  return data
}

/**
 * Update password (used during password recovery session)
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return data
}

/**
 * Ensure patient profile exists in public.profiles table
 */
export async function ensureUserProfile(
  userId: string,
  fullName: string,
  _email?: string
): Promise<UserProfile | null> {
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${userId},auth_user_id.eq.${userId}`)
      .maybeSingle()

    if (existing) {
      return existing
    }

    const newProfile = {
      id: userId,
      auth_user_id: userId,
      patient_id: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      full_name: fullName,
      preferred_name: fullName.split(' ')[0],
      role: 'patient',
    }

    const { data: created, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('Profile insert note:', error.message)
      return null
    }

    return created
  } catch (err: any) {
    console.warn('Could not query profiles table:', err.message)
    return null
  }
}
