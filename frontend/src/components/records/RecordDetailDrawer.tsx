import React, { useState, useEffect } from 'react'
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { Drawer } from '../common/Drawer'
import { StatusBadge } from '../common/StatusBadge'
import type { MedicalRecord, ExtractedLabItem, MedicationItem } from '../../types/health'

interface RecordDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  record: MedicalRecord | null
  onSaveRecord: (updatedRecord: MedicalRecord) => void
}

export const RecordDetailDrawer: React.FC<RecordDetailDrawerProps> = ({
  isOpen,
  onClose,
  record,
  onSaveRecord,
}) => {
  const [formData, setFormData] = useState<MedicalRecord | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (record) {
      setFormData(JSON.parse(JSON.stringify(record)))
      setHasChanges(false)
    }
  }, [record])

  if (!formData || !record) return null

  const handleFieldChange = (
    fieldId: string,
    key: keyof ExtractedLabItem,
    val: string | number
  ) => {
    setFormData((prev) => {
      if (!prev) return null
      const updatedFields = prev.extractedFields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, [key]: val }
        }
        return f
      })
      return { ...prev, extractedFields: updatedFields }
    })
    setHasChanges(true)
  }

  const handleAddLabField = () => {
    const newItem: ExtractedLabItem = {
      id: `ef-new-${Date.now()}`,
      testName: 'New Analyte',
      value: '100',
      unit: 'mg/dL',
      referenceRange: '70 - 120 mg/dL',
      status: 'Within Reference Range',
      category: 'General',
    }
    setFormData((prev) => {
      if (!prev) return null
      return { ...prev, extractedFields: [...prev.extractedFields, newItem] }
    })
    setHasChanges(true)
  }

  const handleDeleteLabField = (fieldId: string) => {
    setFormData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        extractedFields: prev.extractedFields.filter((f) => f.id !== fieldId),
      }
    })
    setHasChanges(true)
  }

  const handleMedicationChange = (
    medId: string,
    key: keyof MedicationItem,
    val: string
  ) => {
    setFormData((prev) => {
      if (!prev) return null
      const updated = (prev.medications || []).map((m) => {
        if (m.id === medId) {
          return { ...m, [key]: val }
        }
        return m
      })
      return { ...prev, medications: updated }
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    if (formData) {
      onSaveRecord(formData)
      setHasChanges(false)
      onClose()
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={formData.name}
      subtitle={`Synthetic Record ID: ${formData.id}`}
      width="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">
            {hasChanges ? 'Unsaved changes in local session' : 'Up to date'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Planned Integration Disclosure Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Info className="w-4 h-4 text-teal-600" />
            <span>Document Extraction &amp; OCR Architecture</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            &ldquo;Document extraction is a planned integration. Any displayed extracted fields are illustrative demo data until the backend is connected.&rdquo;
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Document Metadata
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Category</span>
              <span className="font-semibold text-slate-800">{formData.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Document Date</span>
              <input
                type="date"
                value={formData.recordDate}
                onChange={(e) => {
                  setFormData({ ...formData, recordDate: e.target.value })
                  setHasChanges(true)
                }}
                className="font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Clinical Facility</span>
              <input
                type="text"
                value={formData.facility}
                onChange={(e) => {
                  setFormData({ ...formData, facility: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Ordering Clinician</span>
              <input
                type="text"
                value={formData.clinician}
                onChange={(e) => {
                  setFormData({ ...formData, clinician: e.target.value })
                  setHasChanges(true)
                }}
                className="w-full font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Extracted Laboratory Analytes Form */}
        {formData.extractedFields.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Extracted Analytes &amp; Reference Ranges ({formData.extractedFields.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Review or adjust extracted test metrics
                </p>
              </div>
              <button
                onClick={handleAddLabField}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Field
              </button>
            </div>

            <div className="space-y-2">
              {formData.extractedFields.map((field) => (
                <div
                  key={field.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={field.testName}
                      onChange={(e) =>
                        handleFieldChange(field.id, 'testName', e.target.value)
                      }
                      className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={field.status}
                        onChange={(e) =>
                          handleFieldChange(field.id, 'status', e.target.value)
                        }
                        className="text-[11px] font-medium rounded px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-700"
                      >
                        <option value="Within Reference Range">
                          Within Reference Range
                        </option>
                        <option value="Outside Reference Range">
                          Outside Reference Range
                        </option>
                        <option value="Needs Review">Needs Review</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                      <button
                        onClick={() => handleDeleteLabField(field.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Value</span>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          handleFieldChange(field.id, 'value', e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Unit</span>
                      <input
                        type="text"
                        value={field.unit}
                        onChange={(e) =>
                          handleFieldChange(field.id, 'unit', e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        Lab Reference Range
                      </span>
                      <input
                        type="text"
                        value={field.referenceRange}
                        onChange={(e) =>
                          handleFieldChange(field.id, 'referenceRange', e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state for newly uploaded file without OCR */
          <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-2 bg-slate-50/50">
            <FileText className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
            <h5 className="text-sm font-semibold text-slate-800">
              No Extracted Fields Yet
            </h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Per hackathon requirements, newly uploaded demo files are not given silently fabricated values. Click below to add verified test values manually.
            </p>
            <button
              onClick={handleAddLabField}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Lab Field
            </button>
          </div>
        )}

        {/* Medication Details Form (if applicable) */}
        {formData.medications && formData.medications.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Documented Medications ({formData.medications.length})
            </h4>
            <div className="space-y-2">
              {formData.medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) =>
                        handleMedicationChange(med.id, 'name', e.target.value)
                      }
                      className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none flex-1"
                    />
                    <StatusBadge status={med.status} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Dosage</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) =>
                          handleMedicationChange(med.id, 'dosage', e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Frequency</span>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) =>
                          handleMedicationChange(med.id, 'frequency', e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
