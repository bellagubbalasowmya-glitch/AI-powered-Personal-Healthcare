import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import type { MedicalRecord, RecordCategory } from '../../types/health'
import { api } from '../../services/api'

interface RecordUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onAddRecord: (record: MedicalRecord) => void
}

export const RecordUploadModal: React.FC<RecordUploadModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{
    name: string
    size: string
    type: 'PDF' | 'PNG' | 'JPG' | 'JPEG'
    rawFile: File
  } | null>(null)
  const [docCategory, setDocCategory] = useState<RecordCategory>('Laboratory Report')
  const [facilityName, setFacilityName] = useState('Apex Diagnostics & Clinical Lab')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    setUploadError(null)

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds maximum 10MB limit. Please upload a smaller file.')
      return
    }

    const extension = file.name.split('.').pop()?.toUpperCase() || ''
    const validExtensions = ['PDF', 'PNG', 'JPG', 'JPEG']
    if (!validExtensions.includes(extension)) {
      setUploadError(`Unsupported file format ".${extension || 'unknown'}". Only PDF, PNG, and JPG medical reports are accepted.`)
      return
    }

    const fileType = extension as 'PDF' | 'PNG' | 'JPG' | 'JPEG'
    const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    setSelectedFile({
      name: file.name,
      size: sizeFormatted === '0.0 MB' ? `${Math.round(file.size / 1024)} KB` : sizeFormatted,
      type: fileType,
      rawFile: file,
    })
  }

  const handleRealUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setUploadError(null)

    try {
      const createdRecord = await api.uploadRecord(selectedFile.rawFile, {
        category: docCategory,
        facility: facilityName,
        name: selectedFile.name.replace(/\.[^/.]+$/, ''),
      })

      onAddRecord(createdRecord)
      setIsUploading(false)
      resetSelection()
      onClose()
    } catch (err: any) {
      console.error('[UploadModal] Backend upload failed:', err.message)
      setUploadError(err.message || 'Failed to process document with backend OCR service. Please verify your connection.')
      setIsUploading(false)
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
    setIsUploading(false)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isUploading ? () => {} : onClose}
      title="Upload Health Document"
      subtitle="Securely upload and analyze your clinical reports with OCR"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end w-full gap-2">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRealUpload}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting &amp; Analyzing...</span>
              </>
            ) : (
              'Upload Document'
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Error notification banner */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Upload Error:</span> {uploadError}
            </div>
          </div>
        )}


        {/* Drag and Drop Zone */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-teal-500 bg-teal-50/50'
                : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-teal-50 text-teal-600 inline-block mb-3">
              <UploadCloud className="w-8 h-8 stroke-[1.7]" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              Drag and drop your medical record here
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              or click to browse from your device
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-mono">
                PDF
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-mono">
                PNG
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-mono">
                JPG
              </span>
              <span>up to 10MB</span>
            </div>
          </div>
        ) : (
          /* File Selected Card */
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-teal-600 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {selectedFile.name}
                  </h5>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedFile.size}</span>
                    <span>&bull;</span>
                    <span className="font-mono text-teal-700">{selectedFile.type}</span>
                  </div>
                </div>
              </div>

              {!isUploading && (
                <button
                  onClick={resetSelection}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Document Type Selector */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Document Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as RecordCategory)}
                  disabled={isUploading}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Laboratory Report">Laboratory Report</option>
                  <option value="Prescription">Prescription Slip</option>
                  <option value="Diagnostic Report">Diagnostic / Radiology</option>
                  <option value="Discharge Summary">Discharge / Clinic Note</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Provider / Lab
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Uploading Status */}
            {isUploading && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-teal-800">
                  <span className="font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    Extracting text and running OCR on document...
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-600 h-1.5 rounded-full w-full animate-pulse" />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  )
}
