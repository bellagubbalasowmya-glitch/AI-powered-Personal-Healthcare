import React from 'react'
import {
  FileText,
  Edit3,
  Trash2,
} from 'lucide-react'
import type { MedicalRecord } from '../../types/health'
import { StatusBadge } from '../common/StatusBadge'
import { EmptyState } from '../common/EmptyState'

interface RecordTableProps {
  records: MedicalRecord[]
  onSelectRecord: (record: MedicalRecord) => void
  onDeleteRecord: (id: string) => void
  onOpenUpload: () => void
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onOpenUpload,
}) => {
  if (records.length === 0) {
    return (
      <EmptyState
        title="No Medical Records"
        description="No medical records found. Upload your first clinical document or lab report to get started."
        actionLabel="Upload Document"
        onAction={onOpenUpload}
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-5">Document Name</th>
              <th className="py-3.5 px-4">Document Type</th>
              <th className="py-3.5 px-4">Record Date</th>
              <th className="py-3.5 px-4">Processing Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.map((rec) => (
              <tr
                key={rec.id}
                className="hover:bg-teal-50/20 transition-colors group"
              >
                {/* Document Name & Facility */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-teal-900 transition-colors block text-sm">
                        {rec.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{rec.facility}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-500">{rec.fileSize}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px]">
                          {rec.fileType}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Document Type */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                    {rec.category}
                  </span>
                </td>

                {/* Record Date */}
                <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                  {rec.recordDate}
                </td>

                {/* Processing Status */}
                <td className="py-3.5 px-4">
                  <StatusBadge status={rec.processingStatus} size="sm" />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onSelectRecord(rec)}
                      className="px-3 py-1.5 rounded-lg font-semibold text-xs bg-slate-100 text-slate-700 hover:bg-teal-600 hover:text-white transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Review / Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from demo session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-slate-100 p-2">
        {records.map((rec) => (
          <div key={rec.id} className="p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rec.name}</h4>
                  <p className="text-xs text-slate-500">{rec.facility}</p>
                </div>
              </div>
              <StatusBadge status={rec.processingStatus} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono">{rec.recordDate}</span>
                <span>&bull;</span>
                <span className="text-[11px]">{rec.category}</span>
              </div>
              <button
                onClick={() => onSelectRecord(rec)}
                className="font-semibold text-teal-700 hover:text-teal-800"
              >
                Review &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
