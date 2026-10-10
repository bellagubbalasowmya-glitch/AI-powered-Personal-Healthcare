import React from 'react'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  FileSearch,
  Clock,
  Pill,
  HeartPulse,
  CalendarDays,
  Activity,
  ShieldAlert,
  Bot,
  AlertTriangle,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { SupportedLanguage } from '../../types/health'
import { TRANSLATIONS } from '../../utils/translations'

export type NavPage =
  | 'overview'
  | 'records'
  | 'summary'
  | 'explainer'
  | 'timeline'
  | 'reminders'
  | 'vitals'
  | 'appointments'
  | 'wellness'
  | 'emergency'
  | 'copilot'
  | 'unknown-alert'
  | 'settings'

interface SidebarProps {
  currentPage: NavPage
  onSelectPage: (page: NavPage) => void
  currentLanguage: SupportedLanguage
  isOpenMobile: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  currentLanguage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[currentLanguage]

  const navItems: {
    id: NavPage
    label: string
    icon: React.FC<{ className?: string }>
    badge?: string
    badgeColor?: string
  }[] = [
    { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
    { id: 'records', label: t.navRecords, icon: FileText, badge: '6' },
    { id: 'summary', label: t.navSummary, icon: Sparkles },
    { id: 'explainer', label: t.navExplainer, icon: FileSearch, badge: 'OCR' },
    { id: 'timeline', label: t.navTimeline, icon: Clock },
    { id: 'reminders', label: t.navReminders, icon: Pill, badge: '4 Rx' },
    { id: 'vitals', label: t.navVitals, icon: HeartPulse },
    { id: 'appointments', label: t.navAppointments, icon: CalendarDays },
    { id: 'wellness', label: t.navWellnessTracker, icon: Activity, badge: 'Live' },
    {
      id: 'emergency',
      label: t.navEmergency,
      icon: ShieldAlert,
      badge: 'ICE',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    { id: 'copilot', label: t.navCopilot, icon: Bot, badge: 'AI' },
    {
      id: 'unknown-alert',
      label: t.navUnknownAlert,
      icon: AlertTriangle,
      badge: 'Review',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'settings', label: t.navSettings, icon: SettingsIcon },
  ]

  const handleNavClick = (page: NavPage) => {
    onSelectPage(page)
    onCloseMobile()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding & Demo Badge */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm ring-4 ring-teal-50 shrink-0">
                <div className="relative">
                  <Activity className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base tracking-tight text-slate-900 truncate">
                    {t.appName}
                  </h1>
                </div>
                <p className="text-[11px] text-teal-700 font-medium truncate">
                  Personal Digital Twin &amp; Copilot
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prominent Demo Badge */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-teal-50/40 shrink-0">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-700 text-white tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.demoBadge}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">v1.2-hackathon</span>
            </div>
          </div>

          {/* Navigation Links with Scrollable Container */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-teal-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-teal-700 text-teal-100'
                          : item.badgeColor ||
                            'bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom: Privacy Note & Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-tight">Privacy First</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                {t.privacyNote}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
