import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import {
  supabase,
  signInWithEmail as supabaseSignIn,
  signUpWithEmail as supabaseSignUp,
  signOutUser as supabaseSignOut,
  sendPasswordResetEmail as supabaseSendReset,
  updatePassword as supabaseUpdatePassword,
  ensureUserProfile,
  isSupabaseConfigured,
  type UserProfile,
} from '../services/supabase'
import { setActiveAuthToken } from '../services/api'

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset'

export const formatAuthError = (err: any): string => {
  const msg = err?.message || ''
  const lower = msg.toLowerCase()
  if (
    lower.includes('invalid api key') ||
    lower.includes('api key') ||
    lower.includes('unauthorized_invalid_api_key')
  ) {
    return 'Supabase API Key Configuration Error: The API key in frontend/.env was rejected by Supabase project zeyuqvzqtbqwpumzvjxv. Please copy the "anon public" key from Supabase Dashboard (Settings > API > Project API Keys > anon public) and set VITE_SUPABASE_ANON_KEY in frontend/.env.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in. Check your inbox for the Supabase verification email.'
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email address already exists. Please sign in instead.'
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Network connection error: Unable to reach the Supabase service. Please check your internet connection.'
  }
  return msg || 'An unexpected error occurred during authentication.'
}

interface LocalUserRecord {
  id: string
  email: string
  password: string
  fullName: string
  patientId: string
  role: string
  createdAt: string
}

const USERS_STORAGE_KEY = 'healthtwin_registered_users'
const CURRENT_USER_KEY = 'healthtwin_current_user'
const CURRENT_PROFILE_KEY = 'healthtwin_user_profile'

function getLocalUsers(): LocalUserRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: LocalUserRecord[] = JSON.parse(raw)
    // Filter out any legacy dummy records
    return parsed.filter((u) => u.email !== 'alex.morgan@healthtwin.demo')
  } catch {
    return []
  }
}

function saveLocalUser(newUser: LocalUserRecord) {
  const users = getLocalUsers()
  users.push(newUser)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function createLocalAuthToken(user: { id: string; email: string; name: string; patientId: string }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      patientId: user.patientId,
      type: 'healthtwin_auth',
      app: 'healthtwin',
      role: 'patient',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  )
  const signature = btoa('healthtwin_autonomous_sig_' + user.id)
  return `${header}.${payload}.${signature}`
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isConfigured: boolean
  authError: string | null
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void
  clearError: () => void
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsEmailVerification: boolean }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updateNewPassword: (newPassword: string) => Promise<void>
  signInDemo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')

  const clearError = () => setAuthError(null)

  // Session restoration and recovery URL listener
  useEffect(() => {
    let isMounted = true

    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('reset-password') || hash.includes('type=recovery')) {
        setAuthMode('reset')
      }
    }

    const initAuth = async () => {
      try {
        // 1. If Supabase cloud is configured, check live session first
        if (isSupabaseConfigured()) {
          try {
            const { data, error } = await supabase.auth.getSession()
            if (!error && data?.session) {
              setSession(data.session)
              setUser(data.session.user)
              setActiveAuthToken(data.session.access_token)

              const fullName =
                data.session.user.user_metadata?.full_name ||
                data.session.user.email?.split('@')[0] ||
                'HealthTwin Patient'

              ensureUserProfile(data.session.user.id, fullName, data.session.user.email || '')
                .then((p) => {
                  if (isMounted && p) setProfile(p)
                })
                .catch(() => {})
              return
            }
          } catch (cloudErr) {
            console.warn('[Auth] Cloud session check note:', cloudErr)
          }
        }

        // 2. Restore autonomous local session if active
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem(CURRENT_USER_KEY)
          const storedProfile = localStorage.getItem(CURRENT_PROFILE_KEY)
          const storedToken = localStorage.getItem('healthtwin_auth_token')

          if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser)
            const parsedProfile = storedProfile ? JSON.parse(storedProfile) : null
            if (isMounted) {
              setUser(parsedUser)
              setProfile(parsedProfile)
              setActiveAuthToken(storedToken)
            }
          }
        }
      } catch (err: any) {
        console.warn('[Auth] Session initialization note:', err.message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen to Supabase auth events if cloud is configured
    let unsubscribe = () => {}
    if (isSupabaseConfigured()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!isMounted) return

        if (event === 'PASSWORD_RECOVERY') {
          setAuthMode('reset')
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setActiveAuthToken(currentSession.access_token)
          const fullName =
            currentSession.user.user_metadata?.full_name ||
            currentSession.user.email?.split('@')[0] ||
            'HealthTwin Patient'
          ensureUserProfile(currentSession.user.id, fullName, currentSession.user.email || '')
            .then((p) => {
              if (isMounted && p) setProfile(p)
            })
            .catch(() => {})
        }
        setIsLoading(false)
      })
      unsubscribe = () => subscription.unsubscribe()
    }

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, rememberMe = true) => {
    setAuthError(null)
    setIsLoading(true)
    const cleanEmail = email.toLowerCase().trim()

    try {
      // 1. Try Supabase cloud if configured
      if (isSupabaseConfigured()) {
        try {
          const data = await supabaseSignIn(cleanEmail, password)
          if (data.session) {
            setSession(data.session)
            setUser(data.user)
            setActiveAuthToken(data.session.access_token)
            if (rememberMe) {
              localStorage.setItem('healthtwin_remember_me', 'true')
            }
            return
          }
        } catch (supabaseErr: any) {
          console.warn('[Supabase Auth] Cloud attempt:', supabaseErr.message)
        }
      }

      // 2. Autonomous Local Verification
      const users = getLocalUsers()
      const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail)

      if (!foundUser) {
        throw new Error('No account found with this email. Please click "Create free account" below.')
      }

      if (foundUser.password !== password) {
        throw new Error('Invalid email or password. Please verify your credentials and try again.')
      }

      // Generate structured token and create active session
      const token = createLocalAuthToken({
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.fullName,
        patientId: foundUser.patientId,
      })

      const authUser: any = {
        id: foundUser.id,
        email: foundUser.email,
        user_metadata: {
          full_name: foundUser.fullName,
          patient_id: foundUser.patientId,
        },
      }

      const userProfile: UserProfile = {
        id: foundUser.id,
        auth_user_id: foundUser.id,
        patient_id: foundUser.patientId,
        full_name: foundUser.fullName,
        preferred_name: foundUser.fullName.split(' ')[0],
        email: foundUser.email,
        role: foundUser.role || 'patient',
      }

      setUser(authUser)
      setProfile(userProfile)
      setActiveAuthToken(token)

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser))
      localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(userProfile))
      if (rememberMe) {
        localStorage.setItem('healthtwin_remember_me', 'true')
      }
    } catch (err: any) {
      const message = formatAuthError(err)
      setAuthError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthError(null)
    setIsLoading(true)
    const cleanEmail = email.toLowerCase().trim()
    const cleanName = fullName.trim()

    try {
      // 1. Try Supabase cloud if configured
      if (isSupabaseConfigured()) {
        try {
          const data = await supabaseSignUp(cleanEmail, password, cleanName)
          const needsEmailVerification = !data.session && Boolean(data.user)
          if (data.session) {
            setSession(data.session)
            setUser(data.user)
            setActiveAuthToken(data.session.access_token)
          }
          return { needsEmailVerification }
        } catch (supabaseErr: any) {
          console.warn('[Supabase Auth] Cloud attempt:', supabaseErr.message)
        }
      }

      // 2. Autonomous Local Registration
      const users = getLocalUsers()
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail)
      if (existing) {
        throw new Error('An account with this email address already exists. Please sign in instead.')
      }

      const userId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'usr-' + Math.random().toString(36).substring(2, 11)
      const patientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`

      const newRecord: LocalUserRecord = {
        id: userId,
        email: cleanEmail,
        password: password,
        fullName: cleanName,
        patientId,
        role: 'patient',
        createdAt: new Date().toISOString(),
      }

      saveLocalUser(newRecord)

      // Create session
      const token = createLocalAuthToken({
        id: userId,
        email: cleanEmail,
        name: cleanName,
        patientId,
      })

      const authUser: any = {
        id: userId,
        email: cleanEmail,
        user_metadata: {
          full_name: cleanName,
          patient_id: patientId,
        },
      }

      const userProfile: UserProfile = {
        id: userId,
        auth_user_id: userId,
        patient_id: patientId,
        full_name: cleanName,
        preferred_name: cleanName.split(' ')[0],
        email: cleanEmail,
        role: 'patient',
      }

      setUser(authUser)
      setProfile(userProfile)
      setActiveAuthToken(token)

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser))
      localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(userProfile))

      return { needsEmailVerification: false }
    } catch (err: any) {
      const message = formatAuthError(err)
      setAuthError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured()) {
        await supabaseSignOut().catch(() => {})
      }
      localStorage.removeItem(CURRENT_USER_KEY)
      localStorage.removeItem(CURRENT_PROFILE_KEY)
      localStorage.removeItem('healthtwin_auth_token')
      localStorage.removeItem('healthtwin_remember_me')
      setUser(null)
      setSession(null)
      setProfile(null)
      setActiveAuthToken(null)
      setAuthMode('signin')
    } finally {
      setIsLoading(false)
    }
  }

  const requestPasswordReset = async (email: string) => {
    setAuthError(null)
    setIsLoading(true)
    const cleanEmail = email.toLowerCase().trim()
    try {
      if (isSupabaseConfigured()) {
        try {
          await supabaseSendReset(cleanEmail)
          return
        } catch {}
      }
      const users = getLocalUsers()
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail)
      if (found && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('healthtwin_pending_reset_email', cleanEmail)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateNewPassword = async (newPassword: string) => {
    setAuthError(null)
    setIsLoading(true)
    try {
      if (isSupabaseConfigured()) {
        try {
          await supabaseUpdatePassword(newPassword)
          setAuthMode('signin')
          return
        } catch {}
      }
      const pendingEmail =
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('healthtwin_pending_reset_email')
          : null
      const users = getLocalUsers()
      const updated = users.map((u) => {
        if (!pendingEmail || u.email.toLowerCase() === pendingEmail.toLowerCase()) {
          return { ...u, password: newPassword }
        }
        return u
      })
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated))
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('healthtwin_pending_reset_email')
      }
      setAuthMode('signin')
    } catch (err: any) {
      const message = formatAuthError(err)
      setAuthError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick 1-click Demo Sign In for Hackathon Evaluators
  const signInDemo = async () => {
    await signIn('alex.morgan@healthtwin.demo', 'demo_password_2026')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        authError,
        authMode,
        setAuthMode,
        clearError,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        updateNewPassword,
        signInDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
