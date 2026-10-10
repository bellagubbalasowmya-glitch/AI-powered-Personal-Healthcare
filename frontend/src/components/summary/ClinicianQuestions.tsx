import React, { useState } from 'react'
import { Copy, Check, Stethoscope } from 'lucide-react'

interface ClinicianQuestionsProps {
  questions?: string[]
}

export const ClinicianQuestions: React.FC<ClinicianQuestionsProps> = ({ questions }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!questions || questions.length === 0) return null

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
          <Stethoscope className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Questions for Your Clinician
          </h3>
          <p className="text-xs text-slate-500">
            Suggested talking points to discuss during your next appointment
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-teal-50/30 border border-teal-200/50 hover:bg-teal-50/60 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {q}
              </p>
            </div>
            <button
              onClick={() => handleCopy(q, idx)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-white transition-all shrink-0"
              title="Copy to clipboard"
            >
              {copiedIndex === idx ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
