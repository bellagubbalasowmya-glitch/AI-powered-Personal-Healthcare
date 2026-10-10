import React, { useState } from 'react'
import { Sparkles, Calendar, Building, AlertTriangle, ShieldCheck, Languages } from 'lucide-react'
import type { MedicalRecord } from '../../types/health'

interface SummaryOverviewProps {
  record: MedicalRecord
}

export const SummaryOverviewCard: React.FC<SummaryOverviewProps> = ({ record }) => {
  const [langMode, setLangMode] = useState<'en' | 'te'>('en')
  const outOfRangeCount = record.extractedFields.filter(
    (f) => f.status === 'Outside Reference Range'
  ).length

  const summaryText =
    langMode === 'te' && record.teluguSummary
      ? record.teluguSummary
      : record.summary

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-50 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Your Report, Explained Simply
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider ${
                record.isSynthetic === false
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {record.isSynthetic === false ? 'EXTRACTED SYNTHESIS' : 'DEMO SYNTHESIS'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-assisted plain-language distillation for patient comprehension
          </p>
        </div>

        {/* Source metadata pill & Language Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => setLangMode('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                langMode === 'en'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLangMode('te')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                langMode === 'te'
                  ? 'bg-teal-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              తెలుగు
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-mono text-slate-700">{record.recordDate}</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 line-clamp-1">{record.facility}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Narrative Summary */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {langMode === 'te' ? 'కార్యనిర్వాహక వైద్య సారాంశం (Executive Summary)' : 'Executive Clinical Summary'}
          </h4>
          <span className="text-[11px] text-teal-700 font-medium">
            {langMode === 'te' ? 'సరళమైన తెలుగు వివరణ' : 'Plain Language'}
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {summaryText}
        </p>
      </div>


      {/* Key Findings List */}
      {record.keyFindings && record.keyFindings.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Documented Key Findings ({record.keyFindings.length})
          </h4>
          <ul className="space-y-2">
            {record.keyFindings.map((finding, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50/50 border border-slate-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alert if any values outside range */}
      {outOfRangeCount > 0 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold">Attention:</span> {outOfRangeCount} measured parameter{outOfRangeCount > 1 ? 's are' : ' is'} outside standard laboratory reference intervals. See detailed analytes breakdown below.
          </p>
        </div>
      )}

      {/* Prominent Mandatory Medical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-800">Clinical Disclaimer:</span>{' '}
          &ldquo;This demonstration is informational only. Laboratory results require interpretation in clinical context. It does not diagnose medical conditions or replace professional medical advice.&rdquo;
        </p>
      </div>
    </div>
  )
}
