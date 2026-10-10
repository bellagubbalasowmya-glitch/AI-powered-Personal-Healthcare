import React, { useState } from 'react'
import type { ExtractedLabItem } from '../../types/health'
import { StatusBadge } from '../common/StatusBadge'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface LabValuesTableProps {
  fields: ExtractedLabItem[]
}

export const LabValuesTable: React.FC<LabValuesTableProps> = ({ fields }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'outside'>('all')

  const outsideRangeCount = fields.filter(
    (f) => f.status === 'Outside Reference Range'
  ).length

  const displayedFields =
    filterMode === 'outside'
      ? fields.filter((f) => f.status === 'Outside Reference Range')
      : fields

  if (fields.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-2">
        <div className="p-2.5 rounded-full bg-amber-50 text-amber-600 inline-block">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-800">
          No laboratory results could be extracted. Please upload a readable medical report.
        </p>
        <p className="text-[11px] text-slate-400">
          Ensure your medical document contains visible laboratory test names, values, and reference ranges.
        </p>
      </div>
    )
  }


  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
      {/* Header and Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Biochemical Analytes &amp; Reference Ranges
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({fields.length} measured)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Explicit lab reference ranges provided directly by testing facility
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Analytes ({fields.length})
          </button>
          <button
            onClick={() => setFilterMode('outside')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              filterMode === 'outside'
                ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                : 'text-amber-700 hover:bg-amber-100/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Outside Range ({outsideRangeCount})</span>
          </button>
        </div>
      </div>

      {/* Analytes Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4">Test Name</th>
              <th className="py-3 px-3">Measured Value</th>
              <th className="py-3 px-3">Unit</th>
              <th className="py-3 px-4">Supplied Reference Range</th>
              <th className="py-3 px-4">Range Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {displayedFields.map((item) => {
              const isOut = item.status === 'Outside Reference Range'
              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isOut ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Test Name */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block text-xs">
                      {item.testName}
                    </span>
                    {item.interpretationNotes && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.interpretationNotes}
                      </p>
                    )}
                  </td>

                  {/* Value */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isOut ? 'text-amber-800' : 'text-slate-900'
                      }`}
                    >
                      {item.value}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="py-3 px-3 text-slate-500 font-mono text-xs">
                    {item.unit}
                  </td>

                  {/* Supplied Range */}
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {item.referenceRange}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {displayedFields.length === 0 && filterMode === 'outside' && (
        <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All documented analytes fall within normal reference intervals.</span>
        </div>
      )}
    </div>
  )
}
