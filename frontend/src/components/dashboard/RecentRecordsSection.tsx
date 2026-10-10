import React from 'react'
import {
  FileText,
  FileCheck,
  Stethoscope,
  Building2,
  Calendar,
  ArrowRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react'
import type { MedicalRecord } from '../../types/health'

interface RecentRecordsSectionProps {
  records: MedicalRecord[]
  onViewAllRecords: () => void
  onOpenUpload: () => void
  onSelectRecord?: (record: MedicalRecord) => void
}

export const RecentRecordsSection: React.FC<RecentRecordsSectionProps> = ({
  records,
  onViewAllRecords,
  onOpenUpload,
  onSelectRecord,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Laboratory Report':
        return <FileCheck className="w-4 h-4 text-teal-700" />
      case 'Prescription':
        return <Stethoscope className="w-4 h-4 text-indigo-700" />
      case 'Hospital Visit':
        return <Building2 className="w-4 h-4 text-purple-700" />
      default:
        return <FileText className="w-4 h-4 text-sky-700" />
    }
  }

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'Laboratory Report':
        return 'bg-teal-50'
      case 'Prescription':
        return 'bg-indigo-50'
      case 'Hospital Visit':
        return 'bg-purple-50'
      default:
        return 'bg-sky-50'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Medical Records
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                {records.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical documents and diagnostic panels
            </p>
          </div>
          <button
            onClick={onViewAllRecords}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 transition-colors shrink-0"
          >
            All Records <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {records.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {records.slice(0, 4).map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectRecord ? onSelectRecord(rec) : onViewAllRecords()}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 -mx-2 px-2.5 rounded-xl transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl ${getCategoryBg(
                      rec.category
                    )} group-hover:scale-105 transition-all shrink-0 mt-0.5 shadow-2xs`}
                  >
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-800 transition-colors truncate">
                        {rec.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {rec.category}
                      </span>
                      {rec.isSynthetic && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                          SYNTHETIC DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {rec.facility} • {rec.clinician}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{rec.extractedFields?.length || 0} analytes extracted</span>
                      <span>•</span>
                      <span>{rec.fileType}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                  <span className="text-xs font-medium text-slate-600 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {rec.recordDate}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition-colors mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                No clinical records uploaded yet
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Upload clinic lab reports, prescriptions, or discharge summaries to initialize your digital twin.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Upload Medical Record
            </button>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing top {Math.min(records.length, 4)} of {records.length} records
          </span>
          <button
            onClick={onOpenUpload}
            className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Upload New
          </button>
        </div>
      )}
    </div>
  )
}
