import React from 'react'
import { Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react'
import {
  WELLNESS_TREND_EXPLANATION,
} from '../../data/mockWellness'

export const WellnessTrendsSummary: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {WELLNESS_TREND_EXPLANATION.title}
            </h3>
            <p className="text-xs text-slate-500">
              {WELLNESS_TREND_EXPLANATION.subtitle}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 self-start sm:self-auto tracking-wider">
          ILLUSTRATIVE SYNTHESIS
        </span>
      </div>

      <div className="space-y-2.5">
        {WELLNESS_TREND_EXPLANATION.bulletPoints.map((point, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      {/* Persistent Disclaimer */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold">Guardrail Notice:</span>{' '}
          {WELLNESS_TREND_EXPLANATION.disclaimer}
        </p>
      </div>
    </div>
  )
}
