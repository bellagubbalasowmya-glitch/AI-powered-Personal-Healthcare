import React from 'react'
import { UploadCloud, Bot, HeartPulse, ShieldAlert, ArrowRight } from 'lucide-react'

interface QuickActionsProps {
  onUploadReport: () => void
  onViewTimeline?: () => void
  onAskCopilot: () => void
  onLogVitals?: () => void
  onViewEmergency?: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onUploadReport,
  onAskCopilot,
  onLogVitals,
  onViewEmergency,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key actions to manage, query, and synchronize your health twin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Upload Record */}
        <button
          onClick={onUploadReport}
          className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/30 transition-all text-left shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
        >
          <div className="flex items-start justify-between w-full">
            <div className="p-2.5 rounded-xl bg-teal-600/10 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-2xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
              Upload Document
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              OCR extraction &amp; lab panels
            </p>
          </div>
        </button>

        {/* 2. Ask Copilot */}
        <button
          onClick={onAskCopilot}
          className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/30 transition-all text-left shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
        >
          <div className="flex items-start justify-between w-full">
            <div className="p-2.5 rounded-xl bg-teal-600/10 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
              Health Copilot
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Grounded AI Q&amp;A in plain English
            </p>
          </div>
        </button>

        {/* 3. Log Vitals */}
        {onLogVitals && (
          <button
            onClick={onLogVitals}
            className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/30 transition-all text-left shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <div className="flex items-start justify-between w-full">
              <div className="p-2.5 rounded-xl bg-rose-600/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-2xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-bold text-slate-900 group-hover:text-rose-900">
                Log Health Vitals
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                BP, heart rate, &amp; SpO2
              </p>
            </div>
          </button>
        )}

        {/* 4. Emergency Health Card */}
        {onViewEmergency && (
          <button
            onClick={onViewEmergency}
            className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/30 transition-all text-left shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <div className="flex items-start justify-between w-full">
              <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                Emergency Card
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                First-responder QR &amp; allergies
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
