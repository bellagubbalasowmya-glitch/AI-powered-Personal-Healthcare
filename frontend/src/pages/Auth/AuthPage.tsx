import React, { useState } from 'react'
import {
  Activity,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  KeyRound,
  Check,
  Stethoscope,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react'
import { useAuth, type AuthMode } from '../../context/AuthContext'

export const AuthPage: React.FC = () => {
  const {
    authMode,
    setAuthMode,
    signIn,
    signUp,
    requestPasswordReset,
    updateNewPassword,
    authError,
    clearError,
    isLoading,
    isConfigured,
  } = useAuth()

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Sign Up State
  const [signupFullName, setSignupFullName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Forgot Password & Reset State
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)

  // Local feedback states
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null)
  const [signupSuccessNotice, setSignupSuccessNotice] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleModeChange = (mode: AuthMode) => {
    clearError()
    setValidationError(null)
    setResetSuccessMessage(null)
    setSignupSuccessNotice(null)
    setAuthMode(mode)
  }

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)

    if (!loginEmail.trim()) {
      setValidationError('Please enter your email address.')
      return
    }
    if (!loginPassword) {
      setValidationError('Please enter your account password.')
      return
    }

    try {
      await signIn(loginEmail.trim(), loginPassword, rememberMe)
    } catch {
      // Error handled in AuthContext and rendered via authError
    }
  }

  // Handle Sign Up submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)
    setSignupSuccessNotice(null)

    if (!signupFullName.trim()) {
      setValidationError('Please provide your full legal or preferred name.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!signupEmail.trim() || !emailRegex.test(signupEmail.trim())) {
      setValidationError('Please enter a valid email address.')
      return
    }
    if (signupPassword.length < 6) {
      setValidationError('Password must be at least 6 characters in length.')
      return
    }
    if (signupPassword !== signupConfirmPassword) {
      setValidationError('Password and confirmation do not match.')
      return
    }
    if (!agreeTerms) {
      setValidationError('You must consent to the HealthTwin Privacy Policy and Health Data Processing Terms.')
      return
    }

    try {
      const result = await signUp(signupEmail.trim(), signupPassword, signupFullName.trim())
      if (result.needsEmailVerification) {
        setSignupSuccessNotice(
          `A verification link has been sent to ${signupEmail.trim()}. Please verify your email before signing in.`
        )
      }
    } catch {
      // Error handled in AuthContext
    }
  }

  // Handle Forgot Password submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)
    setResetSuccessMessage(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setValidationError('Please enter a valid email address to send the recovery link.')
      return
    }

    try {
      await requestPasswordReset(forgotEmail.trim())
      setResetSuccessMessage(
        'If an account is associated with this email address, password reset instructions have been sent.'
      )
    } catch {
      // Handled in AuthContext
    }
  }

  // Handle Password Reset confirmation submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)

    if (resetPassword.length < 6) {
      setValidationError('Your new password must be at least 6 characters in length.')
      return
    }
    if (resetPassword !== resetConfirmPassword) {
      setValidationError('New password and confirmation do not match.')
      return
    }

    try {
      await updateNewPassword(resetPassword)
      setResetSuccessMessage('Your password has been successfully updated. Please sign in with your new credentials.')
    } catch {
      // Handled in AuthContext
    }
  }

  return (
    <div className="min-h-screen bg-radial from-slate-50 via-teal-50/20 to-sky-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-950/10 border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* LEFT COLUMN: Healthcare Illustration & Digital Twin Brand Value */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background medical grid and glow circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            {/* HealthTwin Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-300 flex items-center justify-center text-teal-950 shadow-lg shadow-teal-400/30">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-white">HealthTwin AI</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                    v2.4
                  </span>
                </div>
                <p className="text-xs text-teal-200/80 font-medium">Personal Digital Twin & Copilot</p>
              </div>
            </div>

            {/* Medical Telemetry Graphic Card */}
            <div className="pt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white/90">Biometric Sync Engine</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    PostgreSQL Live
                  </span>
                </div>

                {/* Simulated ECG wave */}
                <div className="h-10 w-full flex items-center overflow-hidden">
                  <svg className="w-full h-8 text-teal-300/80" viewBox="0 0 200 40" fill="none">
                    <path
                      d="M0 20 L40 20 L50 5 L60 35 L70 12 L75 25 L85 20 L130 20 L140 8 L148 32 L155 15 L165 20 L200 20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
                  <div>
                    <span className="text-white/60">Target Profile</span>
                    <p className="font-semibold text-white">Alex Morgan (PT-89420)</p>
                  </div>
                  <div>
                    <span className="text-white/60">Digital Twin Health</span>
                    <p className="font-semibold text-teal-300">94% Optimal State</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Value Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700/50 flex items-center justify-center shrink-0 border border-teal-500/30 text-teal-300">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Clinical Record Intelligence</h4>
                  <p className="text-[11px] text-teal-100/70 leading-relaxed">
                    Automated report summarization, bilingual Telugu/English translations, and analyte tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700/50 flex items-center justify-center shrink-0 border border-teal-500/30 text-teal-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Supabase Row-Level Security</h4>
                  <p className="text-[11px] text-teal-100/70 leading-relaxed">
                    Cryptographically isolated patient records with full tenant separation and audit logs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700/50 flex items-center justify-center shrink-0 border border-teal-500/30 text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time Copilot & Care Plan</h4>
                  <p className="text-[11px] text-teal-100/70 leading-relaxed">
                    Medicine reminders, doctor consultations, vitals monitoring, and emergency ICE safety card.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Trust Footnote */}
          <div className="relative z-10 pt-6 mt-6 border-t border-teal-700/50 text-[11px] text-teal-200/60 flex items-center justify-between">
            <span>HIPAA Architecture Standards</span>
            <span className="flex items-center gap-1 text-teal-300 font-medium">
              <Lock className="w-3 h-3" /> End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          
          {/* Top navigation tabs when in signin/signup */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-8 max-w-sm border border-slate-200/70 self-start">
              <button
                type="button"
                id="btn-tab-signin"
                onClick={() => handleModeChange('signin')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signin'
                    ? 'bg-white text-teal-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="btn-tab-signup"
                onClick={() => handleModeChange('signup')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-white text-teal-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Subtitle / Header */}
          <div className="mb-6">
            {authMode === 'signin' && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access your personal digital twin telemetry and verified health records.
                </p>
              </>
            )}
            {authMode === 'signup' && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create HealthTwin Account</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your health data to an AI-powered personal digital twin.
                </p>
              </>
            )}
            {authMode === 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mb-3"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Sign In
                </button>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your email address and we will dispatch a secure Supabase recovery link.
                </p>
              </>
            )}
            {authMode === 'reset' && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set New Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create a strong new password for your HealthTwin account.
                </p>
              </>
            )}
          </div>

          {/* Server / Validation Error Notice */}
          {(authError || validationError) && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                  {authError || validationError}
                </p>
                {authError?.includes('Supabase API Key') && (
                  <div className="pt-1.5 border-t border-rose-200/70 text-[11px] text-rose-700">
                    <a
                      href="https://supabase.com/dashboard/project/zeyuqvzqtbqwpumzvjxv/settings/api"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold underline hover:text-rose-900"
                    >
                      <span>Open Supabase Project Settings &rarr; API</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration Hint Banner when key is missing or placeholder */}
          {!isConfigured && !authError && !validationError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold">Live Supabase Authentication Setup</p>
                <p className="text-amber-800 leading-relaxed">
                  To sign up or sign in with live cloud persistence, set your{' '}
                  <span className="font-bold">anon public</span> key in{' '}
                  <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-amber-950">
                    frontend/.env
                  </code>{' '}
                  as{' '}
                  <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-amber-950">
                    VITE_SUPABASE_ANON_KEY
                  </code>
                  .
                </p>
                <a
                  href="https://supabase.com/dashboard/project/zeyuqvzqtbqwpumzvjxv/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 underline hover:text-amber-800 pt-0.5"
                >
                  <span>Get anon key from Supabase Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {resetSuccessMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-800">{resetSuccessMessage}</p>
              </div>
            </div>
          )}

          {signupSuccessNotice && (
            <div className="mb-6 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-teal-800">{signupSuccessNotice}</p>
                <p className="text-[11px] text-teal-700 mt-1">
                  Once verified, return here to sign in with your email and password.
                </p>
              </div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-signin-submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 shadow-md shadow-teal-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>


              {/* Switch link */}
              <p className="text-center text-xs text-slate-500 pt-2">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Create free account
                </button>
              </p>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal or Preferred Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe or Alex Morgan"
                    autoComplete="name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700 mb-1">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-confirm-password" className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Consent and Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="chk-consent"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                  />
                  <span className="text-[11px] text-slate-600 leading-normal">
                    I consent to the processing of my health telemetry according to the{' '}
                    <span className="text-teal-700 font-semibold underline underline-offset-2">HealthTwin Privacy Policy</span>{' '}
                    and confirm I understand that this system does not replace primary clinical diagnosis.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-signup-submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 shadow-md shadow-teal-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registering with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Create My HealthTwin Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch link */}
              <p className="text-center text-xs text-slate-500 pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Sign in instead
                </button>
              </p>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-forgot-submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 shadow-md shadow-teal-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Recovery Email...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM (Recovery session) */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-new-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-new-password"
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-confirm-password"
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-reset-submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 shadow-md shadow-teal-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Update and Save New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
export default AuthPage
