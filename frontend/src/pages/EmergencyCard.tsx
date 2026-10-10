import React, { useState } from 'react'
import {
  Phone,
  AlertTriangle,
  FileText,
  Edit2,
  Share2,
  Printer,
  User,
  Building,
  Trash2,
  ShieldCheck,
  Lock,
  HeartPulse,
  Heart,
  Droplet,
} from 'lucide-react'
import type { EmergencyCardInfo } from '../types/health'
import { Modal } from '../components/common/Modal'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface EmergencyCardProps {
  cardInfo: EmergencyCardInfo
  onUpdateCardInfo: (info: EmergencyCardInfo) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

export const EmergencyCardPage: React.FC<EmergencyCardProps> = ({
  cardInfo,
  onUpdateCardInfo,
  onShowToast,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'iceCard' | 'detailed' | 'preview'>('iceCard')

  // Edit form state
  const [formData, setFormData] = useState<EmergencyCardInfo>(cardInfo)
  const [newAllergyInput, setNewAllergyInput] = useState('')
  const [newConditionInput, setNewConditionInput] = useState('')
  const [newMedicationInput, setNewMedicationInput] = useState('')

  const handleOpenEdit = () => {
    setFormData(JSON.parse(JSON.stringify(cardInfo)))
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCardInfo({
      ...formData,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' (User Edit)',
    })
    setIsEditModalOpen(false)
    onShowToast('Emergency Card Updated', 'Emergency clinical profile has been updated for this session.', 'success')
  }

  const handleAddAllergy = () => {
    if (newAllergyInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergyInput.trim()],
      }))
      setNewAllergyInput('')
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }))
  }

  const handleAddCondition = () => {
    if (newConditionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, newConditionInput.trim()],
      }))
      setNewConditionInput('')
    }
  }

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== index),
    }))
  }

  const handleAddMedication = () => {
    if (newMedicationInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        criticalMedications: [...prev.criticalMedications, newMedicationInput.trim()],
      }))
      setNewMedicationInput('')
    }
  }

  const handleRemoveMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      criticalMedications: prev.criticalMedications.filter((_, i) => i !== index),
    }))
  }

  const handleSimulateCall = (name: string, phone: string) => {
    onShowToast(
      'Simulating Emergency Call',
      `Connecting simulated priority line to ${name} (${phone}). Demo call only.`,
      'info'
    )
  }

  const handleCopySummary = () => {
    const text = `EMERGENCY MEDICAL PROFILE
Patient: ${cardInfo.patientName} (ID: ${cardInfo.patientId})
Blood Group: ${cardInfo.bloodGroup}
Allergies: ${cardInfo.allergies.join('; ')}
Medications: ${cardInfo.criticalMedications.join('; ')}
Primary Contact: ${cardInfo.emergencyContacts[0]?.name} (${cardInfo.emergencyContacts[0]?.phone})
Primary Physician: ${cardInfo.primaryPhysician.name} (${cardInfo.primaryPhysician.phone})
Hospital: ${cardInfo.preferredHospital}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onShowToast('Emergency Summary Copied', 'Quick medical summary copied to clipboard for emergency responder sharing.', 'success')
      }).catch(() => {
        onShowToast('Summary Ready', 'Medical summary generated.', 'info')
      })
    } else {
      onShowToast('Summary Ready', 'Clipboard access unavailable in current browser context.', 'info')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Emergency Health Card
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
              ICE ACTIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Critical in-case-of-emergency (ICE) clinical summary designed for rapid triage, first responders, and emergency contacts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            Share Summary
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print ICE Card
          </button>
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Privacy &amp; Security Safe Harbor</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-teal-300 font-medium">
                Zero-Knowledge Encrypted
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              This card is visible locally in your session. In production deployments, emergency access is unlocked via lock-screen NFC/QR or biometric responder bypass with zero-knowledge encryption to safeguard protected health information (PHI).
            </p>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('iceCard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'iceCard'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ICE Wallet Card View
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'detailed'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Comprehensive Triage View
        </button>
      </div>

      {/* VIEW 1: ICE WALLET CARD */}
      {activeTab === 'iceCard' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border-2 border-rose-500/30 shadow-xl overflow-hidden print:border-black print:shadow-none">
            {/* Red Triage Header Bar */}
            <div className="bg-linear-to-r from-rose-600 via-rose-700 to-red-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl">
                  +
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wider uppercase flex items-center gap-2">
                    In Case of Emergency (ICE)
                  </h2>
                  <p className="text-[11px] text-rose-100 font-medium">
                    HealthTwin AI • Rapid Responder Clinical Profile
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-xl bg-white text-rose-700 font-black text-sm tracking-wide shadow-xs">
                  {cardInfo.bloodGroup}
                </span>
                <p className="text-[10px] text-rose-200 mt-0.5">Blood Type</p>
              </div>
            </div>

            {/* Patient Header Strip */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-inner">
                    {cardInfo.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{cardInfo.patientName}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-medium text-slate-700">{cardInfo.patientId}</span>
                      <span>•</span>
                      <span>{cardInfo.age} Years Old</span>
                      <span>•</span>
                      <span>{cardInfo.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cardInfo.organDonor && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      Organ Donor
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    Verified ID
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              {/* Critical Allergy Warning Banner */}
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-rose-800 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Known Allergies &amp; Severe Reactions
                </div>
                <div className="space-y-1.5">
                  {cardInfo.allergies.map((allergy, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-900 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span>{allergy}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-rose-600 font-semibold">
                        Alert
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: Medications & Chronic Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Critical Medications */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Droplet className="w-3.5 h-3.5 text-teal-600" />
                    Critical Medications
                  </div>
                  <ul className="space-y-2">
                    {cardInfo.criticalMedications.map((med, i) => (
                      <li
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-800 font-medium"
                      >
                        {med}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chronic Conditions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <HeartPulse className="w-3.5 h-3.5 text-indigo-600" />
                    Chronic Conditions
                  </div>
                  <ul className="space-y-2">
                    {cardInfo.chronicConditions.map((cond, i) => (
                      <li
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-800 font-medium"
                      >
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Emergency Contacts Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  Designated Emergency Contacts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cardInfo.emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{contact.name}</span>
                          {contact.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                              PRIMARY ICE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{contact.relationship}</p>
                        <p className="text-xs font-mono font-semibold text-slate-800 mt-2">
                          {contact.phone}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleSimulateCall(contact.name, contact.phone)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          Simulate Call
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor & Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Attending Physician
                  </div>
                  <p className="font-bold text-slate-900">{cardInfo.primaryPhysician.name}</p>
                  <p className="text-slate-600 text-[11px]">{cardInfo.primaryPhysician.clinic}</p>
                  <p className="text-teal-700 font-mono mt-1 font-semibold">{cardInfo.primaryPhysician.phone}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    Preferred Hospital
                  </div>
                  <p className="font-bold text-slate-900">{cardInfo.preferredHospital}</p>
                  <p className="text-slate-600 text-[11px] mt-1">Level 1 Emergency Facility</p>
                </div>
              </div>

              {/* Responder Notes */}
              {cardInfo.medicalNotes && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Responder Instructions:</span> {cardInfo.medicalNotes}
                </div>
              )}

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Last Verified: {cardInfo.lastUpdated}</span>
                <span>Encrypted Prototype Hash: 0x9F41...B28</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE TRIAGE VIEW */}
      {activeTab === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Resuscitation Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Clinical Resuscitation &amp; Safety Parameters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold">ABO Blood Group</span>
                  <p className="text-lg font-black text-rose-700 mt-1">{cardInfo.bloodGroup}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold">Organ Donor</span>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    {cardInfo.organDonor ? 'Registered' : 'Not Registered'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold">Known Implants</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">None Reported</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold">Triage Priority</span>
                  <p className="text-sm font-bold text-amber-700 mt-1">Standard ICE</p>
                </div>
              </div>
            </div>

            {/* Allergies Deep Dive */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Detailed Allergy Profiles
              </h3>
              <div className="space-y-3">
                {cardInfo.allergies.map((allergy, i) => (
                  <div key={i} className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-rose-900">{allergy}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-800">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-xs text-rose-800/80 mt-1">
                      Caution required when prescribing Beta-Lactam antibiotics or sulfonamides. Cross-reactivity verification advised.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronic Conditions & Maintenance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Active Medical History &amp; Regular Rx
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Active Diagnoses
                  </h4>
                  <ul className="space-y-1.5">
                    {cardInfo.chronicConditions.map((c, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Regular Medications
                  </h4>
                  <ul className="space-y-1.5">
                    {cardInfo.criticalMedications.map((m, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail: Hospital, Physician, Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Emergency Facilities
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-900">{cardInfo.preferredHospital}</p>
                <p className="text-slate-600">Equipped with 24/7 Level 1 Trauma, Comprehensive Stroke, and Cardiac Catheterization.</p>
                <div className="pt-2">
                  <button
                    onClick={() => handleSimulateCall('Hospital ER', '+1-555-019-9110')}
                    className="w-full py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Simulate Hospital Call
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Primary Care Physician</span>
                <p className="font-bold text-slate-900">{cardInfo.primaryPhysician.name}</p>
                <p className="text-slate-600">{cardInfo.primaryPhysician.clinic}</p>
                <p className="font-mono text-teal-700 font-semibold">{cardInfo.primaryPhysician.phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600" />
                Emergency Contact Directory
              </h3>
              <div className="space-y-3">
                {cardInfo.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px]">{contact.relationship}</p>
                    <p className="font-mono text-slate-700 font-semibold mt-1">{contact.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMERGENCY CARD MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Emergency Health Profile"
      >
        <form onSubmit={handleSaveEdit} className="space-y-5">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Ensure all allergy and medication entries match your clinical provider records.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group (ABO/Rh)
              </label>
              <input
                type="text"
                required
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. B+ (Rh Positive)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <input
                type="text"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Allergies editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Known Allergies (Severe)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAllergyInput}
                onChange={(e) => setNewAllergyInput(e.target.value)}
                placeholder="e.g. PENICILLIN (Hives, Anaphylaxis)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {formData.allergies.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-rose-50 rounded-lg">
                  <span className="text-rose-900 font-medium">{a}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(i)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Medications editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Critical Medications
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMedicationInput}
                onChange={(e) => setNewMedicationInput(e.target.value)}
                placeholder="e.g. Atorvastatin 10mg (Daily)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {formData.criticalMedications.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-slate-800 font-medium">{m}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(i)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chronic conditions editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chronic Conditions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newConditionInput}
                onChange={(e) => setNewConditionInput(e.target.value)}
                placeholder="e.g. Mild Dyslipidemia"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {formData.chronicConditions.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-slate-800 font-medium">{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(i)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Doctor & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Doctor &amp; Phone
              </label>
              <input
                type="text"
                value={formData.primaryPhysician.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryPhysician: { ...formData.primaryPhysician, name: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 mb-1"
                placeholder="Doctor Name"
              />
              <input
                type="text"
                value={formData.primaryPhysician.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryPhysician: { ...formData.primaryPhysician, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Emergency Hospital
              </label>
              <input
                type="text"
                value={formData.preferredHospital}
                onChange={(e) => setFormData({ ...formData, preferredHospital: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                placeholder="Hospital Name"
              />
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="organDonor"
                  checked={formData.organDonor}
                  onChange={(e) => setFormData({ ...formData, organDonor: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="organDonor" className="text-xs text-slate-700 font-medium">
                  Registered Organ Donor
                </label>
              </div>
            </div>
          </div>

          {/* Emergency notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Responder Notes / Special Instructions
            </label>
            <textarea
              rows={2}
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. No cardiac pacemakers or metal implants."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
            >
              Save Emergency Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
