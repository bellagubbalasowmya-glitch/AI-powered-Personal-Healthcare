import React from 'react'
import { BookOpen } from 'lucide-react'

interface TerminologyProps {
  terms?: { term: string; definition: string }[]
}

export const TerminologyExplainer: React.FC<TerminologyProps> = ({ terms }) => {
  if (!terms || terms.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Medical Terminology Glossary
          </h3>
          <p className="text-xs text-slate-500">
            Plain-language definitions of clinical acronyms and lab markers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {terms.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded">
                {item.term}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
