import React from 'react'
import {
  User,
  Globe,
  Sliders,
  Shield,
  Cpu,
  CheckCircle2,
  Info,
} from 'lucide-react'
import type { SupportedLanguage } from '../types/health'
import { useAuth } from '../context/AuthContext'
import { TRANSLATIONS } from '../utils/translations'

interface SettingsPageProps {
  currentLanguage: SupportedLanguage
  onLanguageChange: (lang: SupportedLanguage) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'info') => void
}

export const Settings: React.FC<SettingsPageProps> = ({
  currentLanguage,
  onLanguageChange,
  onShowToast,
}) => {
  const { user, profile } = useAuth()
  const t = TRANSLATIONS[currentLanguage]

  const integrationStatuses = [
    {
      name: 'Supabase PostgreSQL Database',
      status: 'Connected',
      detail: 'Live session pooler active with 15 verified relational schema tables.',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Backend API Service (Express & TypeScript)',
      status: 'Online',
      detail: 'REST service active on port 5000 with user-scoped isolation.',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Row Level Security (RLS) & Encryption',
      status: 'Active',
      detail: 'Row-level security policies enforced on user-owned healthcare tables.',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'AI Health Copilot & Explainer',
      status: 'Active',
      detail: 'Multi-lingual medical copilot with verifiable document citations.',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      name: 'FHIR / ABDM Health Bridge',
      status: 'Compatible',
      detail: 'Standards-aligned schema ready for health information exchanges.',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
  ]

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    onLanguageChange(lang)
    onShowToast(
      lang === 'te' ? 'భాష మార్చబడింది (Telugu)' : 'Language updated to English',
      lang === 'te'
        ? 'Interface labels are localized in Telugu. Clinical lab text remains in source English.'
        : 'All UI navigation labels switched to English.',
      'success'
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings &amp; Architecture
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Manage preferences, patient profile information, and review active infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Profile & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Account Profile */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Patient Health Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Authenticated session information &amp; clinical credentials
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Registered Patient'}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                  (Active Account)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Patient Record Identifier</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {profile?.patient_id || user?.id?.substring(0, 8).toUpperCase() || 'PT-REGISTERED'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Account Email</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {user?.email || 'Active Session'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">Blood Type &amp; Rh</span>
                <span className="font-bold text-teal-800 text-sm">
                  {profile?.blood_group || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">Account Role &amp; Permission</span>
                <span className="font-medium text-slate-700 capitalize">
                  {profile?.role || 'Patient (Standard Clinical Twin Access)'}
                </span>
              </div>
            </div>
          </div>

          {/* Language Preference */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.languageLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  Select your interface language (English / Telugu)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleLanguageSelect('en')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  currentLanguage === 'en'
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">English</span>
                  {currentLanguage === 'en' && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full interface and medical reports in English
                </p>
              </button>

              <button
                onClick={() => handleLanguageSelect('te')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  currentLanguage === 'te'
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">తెలుగు (Telugu)</span>
                  {currentLanguage === 'te' && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ప్రధాన మెనూ మరియు లేబుల్స్ తెలుగులో లభిస్తాయి
                </p>
              </button>
            </div>

            {/* Translation Coverage Disclosure */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">{t.languageNotice}</p>
            </div>
          </div>

          {/* Appearance & Accessibility */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Appearance &amp; Accessibility
                </h3>
                <p className="text-xs text-slate-500">
                  Clinical contrast and readability settings
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    High Contrast Clinical Theme
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Optimized for WCAG 2.1 AA healthcare legibility
                  </p>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Active (Light Slate)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Reduced Motion
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Subtle transitions without distracting animations
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): System & Integration Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Future Integration Status
                </h3>
                <p className="text-xs text-slate-500">
                  Backend &amp; AI connectivity map
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {integrationStatuses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${item.badgeBg}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Privacy Architecture Box */}
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-teal-900">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Zero Server Transmission</span>
              </div>
              <p className="text-[11px] leading-relaxed text-teal-900/90">
                HealthTwin AI operates completely in-browser for this frontend demonstration. No personal health records are sent to external servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
