import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  FileText,
  X,
  LogOut,
} from 'lucide-react'
import type { NavPage } from './Sidebar'
import type { SupportedLanguage, MedicalRecord } from '../../types/health'
import { TRANSLATIONS } from '../../utils/translations'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  currentPage: NavPage
  onSelectPage: (page: NavPage) => void
  currentLanguage: SupportedLanguage
  records: MedicalRecord[]
  onOpenRecordDetail: (record: MedicalRecord) => void
  onToggleMobileMenu: () => void
  isBackendLive?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  currentLanguage,
  records,
  onOpenRecordDetail,
  onToggleMobileMenu,
  isBackendLive = true,
}) => {
  const t = TRANSLATIONS[currentLanguage]
  const { user, profile, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Alex Morgan'
  const displayEmail = user?.email || 'alex.morgan@healthtwin.demo'
  const displayPatientId = profile?.patient_id || 'SYN-PT-89420'
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0].toUpperCase())
      .join('') || 'HT'

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
    overview: {
      title: t.navOverview,
      subtitle: 'Personal Health Digital Twin Overview',
    },
    records: {
      title: t.navRecords,
      subtitle: 'Organized Clinical & Diagnostic Documents',
    },
    summary: {
      title: t.navSummary,
      subtitle: 'AI Plain-Language Report Explanations',
    },
    explainer: {
      title: t.navExplainer,
      subtitle: 'Simulated OCR & English/Telugu Medical Terminology Translator',
    },
    timeline: {
      title: t.navTimeline,
      subtitle: 'Chronological Health Journey',
    },
    reminders: {
      title: t.navReminders,
      subtitle: 'Prescription Schedule & Adherence Tracking',
    },
    vitals: {
      title: t.navVitals,
      subtitle: 'Blood Pressure, Pulse, SpO2 & Temperature Tracking',
    },
    appointments: {
      title: t.navAppointments,
      subtitle: 'Clinical Consultations & Visit Preparation',
    },
    wellness: {
      title: t.navWellnessTracker,
      subtitle: 'Habits, Hydration, Sleep & Wearable Trends',
    },
    emergency: {
      title: t.navEmergency,
      subtitle: 'Immediate Clinical Safety Profile & ICE Contacts',
    },
    copilot: {
      title: t.navCopilot,
      subtitle: 'Conversational Health Assistant',
    },
    'unknown-alert': {
      title: t.navUnknownAlert,
      subtitle: 'Clinical Data Quality & Uncertainty Detection Engine',
    },
    settings: {
      title: t.navSettings,
      subtitle: 'Preferences & System Status',
    },
  }

  // Filtered demo records for quick search
  const filteredRecords = searchQuery.trim()
    ? records.filter((r) => {
        const query = searchQuery.toLowerCase()
        return (
          r.name.toLowerCase().includes(query) ||
          r.facility.toLowerCase().includes(query) ||
          r.clinician.toLowerCase().includes(query) ||
          r.extractedFields.some((f) => f.testName.toLowerCase().includes(query)) ||
          r.medications?.some((m) => m.name.toLowerCase().includes(query))
        )
      })
    : []

  const notifications: Array<{ id: string; title: string; time: string; desc: string; unread: boolean }> = []

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>HealthTwin AI</span>
            <span>/</span>
            <span className="text-teal-700 font-semibold">
              {pageTitles[currentPage].title}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
            {pageTitles[currentPage].title}
          </h2>
        </div>
      </div>

      {/* Middle: Quick Record Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-72 overflow-y-auto">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Matching Synthetic Records ({filteredRecords.length})
            </div>
            {filteredRecords.length > 0 ? (
              <div className="space-y-1 mt-1">
                {filteredRecords.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      onOpenRecordDetail(rec)
                      setIsSearchFocused(false)
                      setSearchQuery('')
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">
                          {rec.name}
                        </span>
                        <p className="text-[11px] text-slate-500">{rec.facility}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rec.recordDate}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching demo records found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & Demo Patient Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend API Status Pill */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
          isBackendLive
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isBackendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <span>{isBackendLive ? 'API: Express Online' : 'API: Offline Cache'}</span>
        </div>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                <span className="text-[11px] text-slate-400">{notifications.length} recent</span>
              </div>
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100 mt-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">{displayName}</span>
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {user ? 'AUTHENTICATED' : 'DEMO'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{displayPatientId}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{displayName}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate">{displayEmail}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {displayPatientId}
                  </span>
                </div>
              </div>

              <div className="py-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Role:</span>
                  <span className="font-semibold text-slate-900 uppercase text-[11px]">{profile?.role || 'Patient'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Security Auth:</span>
                  <span className="font-semibold text-teal-700">Supabase RLS</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Blood Group:</span>
                  <span className="font-semibold text-slate-900">{profile?.blood_group || 'B+ (Verified)'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    onSelectPage('settings')
                    setIsProfileOpen(false)
                  }}
                  className="w-full text-center py-2 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors"
                >
                  Manage Account Settings
                </button>
                <button
                  onClick={async () => {
                    setIsProfileOpen(false)
                    await signOut()
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
