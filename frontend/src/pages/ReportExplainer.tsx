import React, { useState } from 'react'
import {
  UploadCloud,
  Edit2,
  Languages,
  BookOpen,
  Info,
  Sparkles,
} from 'lucide-react'
import type { ReportExplainerDocument, ExtractedLabItem } from '../types/health'
import { StatusBadge } from '../components/common/StatusBadge'
import { Modal } from '../components/common/Modal'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface ReportExplainerProps {
  documents: ReportExplainerDocument[]
  onUpdateDocument: (doc: ReportExplainerDocument) => void
  onAddDocument: (doc: ReportExplainerDocument) => void
  onDeleteDocument?: (id: string) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

export const ReportExplainerPage: React.FC<ReportExplainerProps> = ({
  documents,
  onUpdateDocument,
  onAddDocument,
  onShowToast,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '')
  const [languageMode, setLanguageMode] = useState<'en' | 'te'>('en')
  const [dragActive, setDragActive] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAnalyte, setEditingAnalyte] = useState<ExtractedLabItem | null>(null)

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0]

  // File drag-drop simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateNewReportUpload(e.dataTransfer.files[0].name)
    }
  }

  const simulateNewReportUpload = (fileName: string) => {
    const newDoc: ReportExplainerDocument = {
      id: `rep-${Date.now()}`,
      fileName,
      fileSize: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      category: 'Simulated Lab Sheet',
      extractionStatus: 'Complete (Demo)',
      isDemoSimulation: true,
      analytes: [
        {
          id: `an-${Date.now()}-1`,
          testName: 'Simulated Fasting Glucose',
          value: 104,
          unit: 'mg/dL',
          referenceRange: '70 - 99 mg/dL',
          status: 'Outside Reference Range',
          category: 'Metabolic',
          interpretationNotes: 'Borderline reading from sample file.',
          teluguExplanation: 'ఉపవాస చక్కెర స్థాయి 104 mg/dL గా గుర్తించబడింది.',
        },
        {
          id: `an-${Date.now()}-2`,
          testName: 'Simulated Creatinine',
          value: 0.95,
          unit: 'mg/dL',
          referenceRange: '0.6 - 1.2 mg/dL',
          status: 'Within Reference Range',
          category: 'Renal',
          interpretationNotes: 'Normal renal filter.',
          teluguExplanation: 'క్రియాటినిన్ సాధారణ పరిధిలో ఉంది.',
        },
      ],
      plainEnglishSummary: `Demo OCR processed "${fileName}". Two analyte parameters simulated for verification.`,
      teluguSummary: `డెమో OCR ద్వారా "${fileName}" ప్రాసెస్ చేయబడింది. ఫలితాలు క్రింద వివరించబడ్డాయి.`,
      terminology: [
        {
          term: 'Fasting Blood Glucose',
          english: 'Blood sugar level measured after an 8-12 hour overnight fast.',
          telugu: '8-12 గంటల ఉపవాసం తర్వాత పరీక్షించే రక్త చక్కెర స్థాయి.',
        },
      ],
    }

    onAddDocument(newDoc)
    setSelectedDocId(newDoc.id)
    onShowToast('Report Ingested (Demo)', `Recognized 2 analytes from ${fileName}. Review extracted fields below.`, 'success')
  }

  // Open edit modal for a specific analyte
  const handleEditAnalyte = (analyte: ExtractedLabItem) => {
    setEditingAnalyte({ ...analyte })
    setIsEditModalOpen(true)
  }

  const handleSaveAnalyteCorrection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnalyte || !activeDoc) return

    const updatedAnalytes = activeDoc.analytes.map((a) =>
      a.id === editingAnalyte.id ? editingAnalyte : a
    )

    const updatedDoc: ReportExplainerDocument = {
      ...activeDoc,
      analytes: updatedAnalytes,
    }

    onUpdateDocument(updatedDoc)
    setIsEditModalOpen(false)
    onShowToast('Field Corrected', `Updated "${editingAnalyte.testName}" values.`, 'success')
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Header with Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Medical Report Explainer
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              OCR &amp; TERMINOLOGY
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Inspect extracted laboratory values, correct recognition errors, and translate complex terms into Simple English or Telugu.
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto border border-slate-200/80">
          <Languages className="w-4 h-4 text-slate-500 ml-1.5" />
          <button
            onClick={() => setLanguageMode('en')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              languageMode === 'en'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguageMode('te')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              languageMode === 'te'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            తెలుగు (Telugu)
          </button>
        </div>
      </div>

      {/* Mandatory Simulated OCR Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Prototype Disclosure:</strong> OCR document extraction is simulated locally. Any displayed extracted fields are demonstration data until the Python/FastAPI backend and OCR models are connected.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => simulateNewReportUpload(`Sample_Lab_Report_${Date.now().toString().slice(-4)}.pdf`)}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-teal-500 bg-teal-50/50'
            : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/70 bg-white'
        }`}
      >
        <div className="p-2.5 rounded-full bg-teal-50 text-teal-600 inline-block mb-2">
          <UploadCloud className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900">
          Drag and drop medical report here or click to simulate upload
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Supports PDF, PNG, JPG laboratory slips (Simulated OCR ingestion)
        </p>
      </div>

      {/* Document Selector Bar */}
      {documents.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
            Available Reports:
          </span>
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border ${
                doc.id === activeDoc.id
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {doc.fileName}
            </button>
          ))}
        </div>
      )}

      {/* Main Explainer View for Active Document */}
      {activeDoc && (
        <div className="space-y-6">
          {/* Executive Summary Card (English / Telugu) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {languageMode === 'en' ? 'Plain-Language Report Explanation' : 'సాధారణ భాషలో నివేదిక వివరణ'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    File: {activeDoc.fileName} &bull; Uploaded: {activeDoc.uploadDate}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeDoc.extractionStatus}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
              {languageMode === 'en' ? activeDoc.plainEnglishSummary : activeDoc.teluguSummary}
            </p>
          </div>

          {/* Extracted Analytes & Correction Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Extracted Lab Analytes &amp; User Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Click &ldquo;Correct&rdquo; to adjust misrecognized numbers or lab units
                </p>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {activeDoc.analytes.length} extracted items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-3">Measured Value</th>
                    <th className="py-3 px-3">Unit</th>
                    <th className="py-3 px-4">Reference Range</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Explanation ({languageMode === 'en' ? 'English' : 'తెలుగు'})</th>
                    <th className="py-3 px-4 text-right">Correction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeDoc.analytes.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.testName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.value}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.unit}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.referenceRange}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                        {languageMode === 'en'
                          ? item.interpretationNotes || 'Within expected parameters.'
                          : item.teluguExplanation || item.interpretationNotes}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEditAnalyte(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-teal-600 hover:text-white transition-all text-slate-700 inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medical Terminology Translation Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {languageMode === 'en' ? 'Medical Terminology Definitions' : 'వైద్య పరిభాష పదకోశం (Terminology)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {languageMode === 'en' ? 'Clear clinical explanations for tests in this report' : 'ఈ నివేదికలోని పరీక్షల వివరాలు సులభమైన తెలుగులో'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeDoc.terminology.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="font-bold text-xs text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded inline-block">
                    {t.term}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">
                    {languageMode === 'en' ? t.english : t.telugu}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Correction Modal */}
      {editingAnalyte && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Correct Analyte: ${editingAnalyte.testName}`}
          subtitle="Adjust OCR recognized values or laboratory units"
          maxWidth="md"
        >
          <form onSubmit={handleSaveAnalyteCorrection} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Test / Analyte Name</label>
              <input
                type="text"
                value={editingAnalyte.testName}
                onChange={(e) => setEditingAnalyte({ ...editingAnalyte, testName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Measured Value</label>
                <input
                  type="text"
                  value={editingAnalyte.value}
                  onChange={(e) => setEditingAnalyte({ ...editingAnalyte, value: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Unit</label>
                <input
                  type="text"
                  value={editingAnalyte.unit}
                  onChange={(e) => setEditingAnalyte({ ...editingAnalyte, unit: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Supplied Reference Range</label>
              <input
                type="text"
                value={editingAnalyte.referenceRange}
                onChange={(e) => setEditingAnalyte({ ...editingAnalyte, referenceRange: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Range Classification</label>
              <select
                value={editingAnalyte.status}
                onChange={(e) => setEditingAnalyte({ ...editingAnalyte, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              >
                <option value="Within Reference Range">Within Reference Range</option>
                <option value="Outside Reference Range">Outside Reference Range</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
              >
                Save Correction
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
