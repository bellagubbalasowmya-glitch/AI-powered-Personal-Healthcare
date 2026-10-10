import React, { useState, useEffect } from 'react'
import { ChevronDown, AlertCircle, UploadCloud } from 'lucide-react'
import type { MedicalRecord } from '../types/health'
import { SummaryOverviewCard } from '../components/summary/SummaryOverviewCard'
import { LabValuesTable } from '../components/summary/LabValuesTable'
import { TerminologyExplainer } from '../components/summary/TerminologyExplainer'
import { ClinicianQuestions } from '../components/summary/ClinicianQuestions'

interface HealthSummaryPageProps {
  records: MedicalRecord[]
  onOpenUpload?: () => void
}

export const HealthSummary: React.FC<HealthSummaryPageProps> = ({ records, onOpenUpload }) => {
  // Prefer record with extracted fields, or latest uploaded record
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records[0]?.id || ''
  )

  useEffect(() => {
    if (records.length > 0 && (!selectedRecordId || !records.find((r) => r.id === selectedRecordId))) {
      setSelectedRecordId(records[0].id)
    }
  }, [records, selectedRecordId])

  const selectedRecord =
    records.find((r) => r.id === selectedRecordId) || records[0]

  if (!selectedRecord) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Health Summary
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Clear, patient-friendly explanations grounded in your documented lab results.
          </p>
        </div>
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
          No medical records found to summarize. Upload your lab reports to see an automated AI clinical breakdown.
        </div>
      </div>
    )
  }

  const hasLabResults = selectedRecord.extractedFields && selectedRecord.extractedFields.length > 0

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header and Report Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Health Summary
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Clear, patient-friendly explanations grounded in your documented lab results.
          </p>
        </div>

        {/* Action Controls: Upload & Report Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-2xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Report</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Selected Report:
            </label>
            <div className="relative">
              <select
                value={selectedRecord.id}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.recordDate})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>


      {/* Notice when selected report contains no laboratory results */}
      {!hasLabResults && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">
              No laboratory results could be extracted. Please upload a readable medical report.
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              HealthTwin AI inspected &ldquo;{selectedRecord.name}&rdquo; but could not detect structured clinical analytes or numeric values. Please upload a clear diagnostic lab sheet or image to generate full interactive metrics.
            </p>
          </div>
        </div>
      )}

      {/* Main Executive Summary Card */}
      <SummaryOverviewCard record={selectedRecord} />

      {/* Laboratory Analytes Table (with explicit reference ranges & status indicators) */}
      <LabValuesTable fields={selectedRecord.extractedFields} />


      {/* Medical Terminology Explainer */}
      <TerminologyExplainer terms={selectedRecord.terminologyGlossary} />

      {/* Questions to Discuss with a Clinician */}
      <ClinicianQuestions questions={selectedRecord.clinicianDiscussionQuestions} />
    </div>
  )
}
