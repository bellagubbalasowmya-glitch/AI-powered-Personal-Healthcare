import React, { useState, useMemo } from 'react'
import { UploadCloud, Info } from 'lucide-react'
import type { MedicalRecord, RecordCategory } from '../types/health'
import { RecordTable } from '../components/records/RecordTable'
import { RecordFilterBar } from '../components/records/RecordFilterBar'
import { RecordDetailDrawer } from '../components/records/RecordDetailDrawer'
import { RecordUploadModal } from '../components/records/RecordUploadModal'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface MedicalRecordsPageProps {
  records: MedicalRecord[]
  onAddRecord: (record: MedicalRecord) => void
  onUpdateRecord: (record: MedicalRecord) => void
  onDeleteRecord: (id: string) => void
  activeDrawerRecord: MedicalRecord | null
  setActiveDrawerRecord: (record: MedicalRecord | null) => void
  isUploadOpen: boolean
  setIsUploadOpen: (open: boolean) => void
}

export const MedicalRecords: React.FC<MedicalRecordsPageProps> = ({
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  activeDrawerRecord,
  setActiveDrawerRecord,
  isUploadOpen,
  setIsUploadOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc'>('date-desc')

  const categories: RecordCategory[] = [
    'Laboratory Report',
    'Prescription',
    'Discharge Summary',
    'Diagnostic Report',
  ]

  const filteredRecords = useMemo(() => {
    let result = [...records]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.facility.toLowerCase().includes(q) ||
          r.clinician.toLowerCase().includes(q) ||
          r.extractedFields.some((f) => f.testName.toLowerCase().includes(q)) ||
          r.medications?.some((m) => m.name.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((r) => r.category === selectedCategory)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
      }
      if (sortBy === 'date-asc') {
        return new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    return result
  }, [records, searchQuery, selectedCategory, sortBy])

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Header with Title and Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Records
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Bring your healthcare documents together in one organized place.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Info notice about secure storage */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Secure Storage:</strong> Clinical documents and diagnostic reports are securely encrypted and indexed in your private HealthTwin database.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <RecordFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        totalResults={filteredRecords.length}
      />

      {/* Records Table */}
      <RecordTable
        records={filteredRecords}
        onSelectRecord={(rec) => setActiveDrawerRecord(rec)}
        onDeleteRecord={onDeleteRecord}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Detail / Edit Drawer */}
      <RecordDetailDrawer
        isOpen={Boolean(activeDrawerRecord)}
        onClose={() => setActiveDrawerRecord(null)}
        record={activeDrawerRecord}
        onSaveRecord={onUpdateRecord}
      />

      {/* Upload Simulation Modal */}
      <RecordUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddRecord={onAddRecord}
      />
    </div>
  )
}
