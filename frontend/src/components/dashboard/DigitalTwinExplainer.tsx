import React from 'react'
import { Dna, ShieldCheck, Cpu, ArrowUpRight, ArrowRight, MessageSquareText } from 'lucide-react'

interface DigitalTwinExplainerProps {
  onExploreRecords?: () => void
  onAskCopilot?: () => void
}

export const DigitalTwinExplainer: React.FC<DigitalTwinExplainerProps> = ({
  onExploreRecords,
  onAskCopilot,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-800/90">
      {/* Background subtle radial glow */}
      <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Header & Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-2xs">
              <Dna className="w-3.5 h-3.5" />
              Concept Architecture
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Multi-Source Personal Health Model
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onAskCopilot && (
              <button
                onClick={onAskCopilot}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-teal-400" />
                Ask Copilot
              </button>
            )}
            {onExploreRecords && (
              <button
                onClick={onExploreRecords}
                className="text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 transition-colors"
              >
                Explore Records <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Title & Concise Definition */}
        <div className="space-y-1.5 max-w-3xl">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            How HealthTwin AI Builds Your Digital Twin
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A dynamic, structured digital representation synthesizing multi-facility clinical records, lab analytes, and patient-reported vitals to power informed doctor consultations.
          </p>
        </div>

        {/* Concise Architecture Pipeline Flow */}
        <div className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
          <span className="text-teal-300 font-semibold">Pipeline:</span>
          <span>1. Ingestion &amp; OCR</span>
          <span className="text-slate-500">&rarr;</span>
          <span>2. Schema Normalization</span>
          <span className="text-slate-500">&rarr;</span>
          <span>3. Grounded Twin Model</span>
          <span className="text-slate-500">&rarr;</span>
          <span className="text-teal-300 font-medium">4. Doctor Consultation Ready</span>
        </div>

        {/* 3 Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/80 transition-all space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
              <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-300 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-sm">Unified Synthesis</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Standardizes diagnostic panels, medication histories, and clinical discharge summaries into a unified personal record.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/80 transition-all space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
              <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-sm">Grounded AI Ethics</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Zero hallucinated scores. Inferences are strictly linked to verified lab reference intervals and documented medical context.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/80 transition-all space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
              <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-300 shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-slate-200 text-sm">Doctor Alignment</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowers patients with structured consultation questions and plain-language bilingual terminology for doctor visits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
