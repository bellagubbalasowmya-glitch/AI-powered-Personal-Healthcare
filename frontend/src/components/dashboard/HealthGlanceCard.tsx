import React from 'react'
import {
  Activity,
  Database,
  Info,
  ArrowRight,
  FileText,
  HeartPulse,
  PlusCircle,
} from 'lucide-react'
import type { VitalMeasurement } from '../../types/health'

interface HealthGlanceProps {
  latestReportName?: string
  latestReportDate?: string
  latestReportCategory?: string
  latestVitals?: VitalMeasurement
  totalRecordsCount: number
  activeRemindersCount: number
  completenessPercent: number
  onViewSummary: () => void
  onOpenUpload?: () => void
  onNavigateVitals?: () => void
}

export const HealthGlanceCard: React.FC<HealthGlanceProps> = ({
  latestReportName,
  latestReportDate,
  latestReportCategory,
  latestVitals,
  totalRecordsCount,
  activeRemindersCount,
  completenessPercent,
  onViewSummary,
  onOpenUpload,
  onNavigateVitals,
}) => {
  const hasRecords = totalRecordsCount > 0
  const hasVitals = !!latestVitals
  const hasReminders = activeRemindersCount > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Health at a Glance
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                hasRecords
                  ? 'bg-teal-50 text-teal-700 border-teal-200/80'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {hasRecords ? 'DIGITAL TWIN ACTIVE' : 'AWAITING RECORDS'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of your synchronized medical documents, vitals, and adherence
          </p>
        </div>

        <button
          onClick={onViewSummary}
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 self-start sm:self-auto transition-colors shrink-0"
        >
          View Full AI Summary <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Metric Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Latest Documented Record */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Latest Document
              </span>
              {latestReportCategory && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/60">
                  {latestReportCategory}
                </span>
              )}
            </div>

            {hasRecords ? (
              <div>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">
                  {latestReportName || 'Medical Record'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Documented: {latestReportDate || 'Recent'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">
                  No records uploaded yet
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload blood tests or clinic discharge summaries to initialize your twin.
                </p>
              </div>
            )}
          </div>

          {!hasRecords && onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Upload Record
            </button>
          )}
        </div>

        {/* Box 2: Latest Vitals Reading */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Vitals Telemetry
              </span>
              {hasVitals && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-rose-600 border border-slate-200/60">
                  {latestVitals.isCautious ? 'Needs Review' : 'Documented'}
                </span>
              )}
            </div>

            {hasVitals ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {latestVitals.systolic}/{latestVitals.diastolic}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">mmHg BP</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pulse: <strong className="text-slate-800">{latestVitals.pulse} bpm</strong> • SpO2:{' '}
                  <strong className="text-slate-800">{latestVitals.oxygenSaturation}%</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">
                  No vital signs logged
                </p>
                <p className="text-[11px] text-slate-400">
                  Track blood pressure, heart rate, and oxygen levels for doctor visits.
                </p>
              </div>
            )}
          </div>

          {!hasVitals && onNavigateVitals && (
            <button
              onClick={onNavigateVitals}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Log Vitals
            </button>
          )}
        </div>

        {/* Box 3: Data Readiness & Completeness */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-teal-600" />
                Twin Completeness
              </span>
              <span className="font-bold text-teal-700">{completenessPercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(completenessPercent, 5)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
              <span
                className={`px-1.5 py-0.5 rounded font-medium ${
                  hasRecords
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                Labs {hasRecords ? '✓' : '—'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded font-medium ${
                  hasVitals
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                Vitals {hasVitals ? '✓' : '—'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded font-medium ${
                  hasReminders
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                Rx Schedule {hasReminders ? '✓' : '—'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {completenessPercent === 100
              ? 'Complete multi-source twin model ready for AI analysis.'
              : 'Add records, vitals, or medication regimens to enrich your twin.'}
          </p>
        </div>
      </div>

      {/* Clinical Transparency Principle Guardrail Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/60 text-xs text-teal-900">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="font-semibold text-teal-950">Clinical Transparency Guardrail:</strong>{' '}
          HealthTwin AI synthesizes and indexes verified health data for doctor consultations. It does not compute speculative disease risk scores or make independent medical diagnoses.
        </p>
      </div>
    </div>
  )
}
