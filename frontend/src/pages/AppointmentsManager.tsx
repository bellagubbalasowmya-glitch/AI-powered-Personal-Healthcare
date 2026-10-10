import React, { useState } from 'react'
import {
  CalendarDays,
  MapPin,
  User,
  Plus,
  Edit2,
  CalendarX,
  RotateCw,
  Search,
  AlertCircle,
  Video,
  FileText,
  Trash2,
} from 'lucide-react'
import type { DoctorAppointment } from '../types/health'
import { Modal } from '../components/common/Modal'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface AppointmentsManagerProps {
  appointments: DoctorAppointment[]
  onAddAppointment: (appointment: DoctorAppointment) => void
  onUpdateAppointment: (appointment: DoctorAppointment) => void
  onDeleteAppointment: (id: string) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

export const AppointmentsManagerPage: React.FC<AppointmentsManagerProps> = ({
  appointments,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Upcoming' | 'Past'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rescheduleApt, setRescheduleApt] = useState<DoctorAppointment | null>(null)
  const [editingApt, setEditingApt] = useState<DoctorAppointment | null>(null)
  const [cancelConfirmApt, setCancelConfirmApt] = useState<DoctorAppointment | null>(null)

  // Form states
  const [formDoctor, setFormDoctor] = useState('')
  const [formSpecialty, setFormSpecialty] = useState('Primary Care / Internal Medicine')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formTime, setFormTime] = useState('10:00 AM')
  const [formDuration, setFormDuration] = useState('30')
  const [formClinic, setFormClinic] = useState('Metro Health Center')
  const [formLocation, setFormLocation] = useState('Suite 200, Main Medical Pavilion')
  const [formVisitType, setFormVisitType] = useState<'In-Person' | 'Telehealth Video'>('In-Person')
  const [formReason, setFormReason] = useState('')
  const [formPrep, setFormPrep] = useState('')

  // Reschedule date/time states
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  const openAddModal = () => {
    setEditingApt(null)
    setFormDoctor('')
    setFormSpecialty('Primary Care / Internal Medicine')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormTime('10:00 AM')
    setFormDuration('30')
    setFormClinic('Metro Health Center')
    setFormLocation('Suite 200, Main Medical Pavilion')
    setFormVisitType('In-Person')
    setFormReason('')
    setFormPrep('')
    setIsModalOpen(true)
  }

  const openEditModal = (apt: DoctorAppointment) => {
    setEditingApt(apt)
    setFormDoctor(apt.doctorName)
    setFormSpecialty(apt.specialty)
    setFormDate(apt.date)
    setFormTime(apt.time)
    setFormDuration(apt.durationMinutes.toString())
    setFormClinic(apt.clinicHospital)
    setFormLocation(apt.location)
    setFormVisitType(apt.visitType === 'Telehealth Video' ? 'Telehealth Video' : 'In-Person')
    setFormReason(apt.reason)
    setFormPrep(apt.preparationNotes)
    setIsModalOpen(true)
  }

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDoctor.trim() || !formReason.trim()) {
      onShowToast('Validation Error', 'Please specify doctor name and visit reason.', 'warning')
      return
    }

    if (editingApt) {
      const updated: DoctorAppointment = {
        ...editingApt,
        doctorName: formDoctor.trim(),
        specialty: formSpecialty,
        date: formDate,
        time: formTime,
        durationMinutes: parseInt(formDuration, 10) || 30,
        clinicHospital: formClinic.trim(),
        location: formLocation.trim(),
        visitType: formVisitType,
        reason: formReason.trim(),
        preparationNotes: formPrep.trim(),
      }
      onUpdateAppointment(updated)
      onShowToast('Appointment Updated', `Consultation with ${updated.doctorName} updated.`, 'success')
    } else {
      const newApt: DoctorAppointment = {
        id: `apt-${Date.now()}`,
        doctorName: formDoctor.trim(),
        specialty: formSpecialty,
        date: formDate,
        time: formTime,
        durationMinutes: parseInt(formDuration, 10) || 30,
        clinicHospital: formClinic.trim(),
        location: formLocation.trim(),
        visitType: formVisitType,
        reason: formReason.trim(),
        preparationNotes: formPrep.trim() || 'Bring current health records and ID.',
        status: 'Confirmed (Local Demo)',
        isLocalDemo: true,
      }
      onAddAppointment(newApt)
      onShowToast('Appointment Scheduled (Demo)', `Added demo consultation with ${newApt.doctorName}.`, 'success')
    }

    setIsModalOpen(false)
  }

  const handleConfirmReschedule = () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) {
      onShowToast('Missing Fields', 'Please select a new date and time.', 'warning')
      return
    }

    const updated: DoctorAppointment = {
      ...rescheduleApt,
      date: rescheduleDate,
      time: rescheduleTime,
      status: 'Rescheduled',
    }

    onUpdateAppointment(updated)
    setRescheduleApt(null)
    onShowToast('Appointment Rescheduled', `Moved appointment to ${rescheduleDate} at ${rescheduleTime}.`, 'info')
  }

  const handleConfirmCancel = () => {
    if (!cancelConfirmApt) return

    const updated: DoctorAppointment = {
      ...cancelConfirmApt,
      status: 'Cancelled',
    }

    onUpdateAppointment(updated)
    setCancelConfirmApt(null)
    onShowToast('Appointment Cancelled', 'Appointment status marked as Cancelled.', 'info')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.clinicHospital.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (selectedFilter === 'Upcoming') {
      return apt.date >= todayStr && apt.status !== 'Completed' && apt.status !== 'Cancelled'
    }
    if (selectedFilter === 'Past') {
      return apt.date < todayStr || apt.status === 'Completed' || apt.status === 'Cancelled'
    }

    return true
  })

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Doctor Appointment Manager
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              CLINICAL SCHEDULER
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Coordinate clinical consultations, prepare discussion notes, and track visit histories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment (Demo)</span>
        </button>
      </div>

      {/* Explicit Local Demo Distinction Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-slate-900 font-semibold">Local Prototype Booking Notice:</strong> Appointments managed here are simulated prototype entries stored within your local browser session. They do not transmit to an external hospital EHR or book real clinic slots.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appointments by doctor, clinic, specialty, or reason..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            {(['All', 'Upcoming', 'Past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedFilter === tab
                    ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Cards List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'Confirmed (Local Demo)'
            const isRescheduled = apt.status === 'Rescheduled'
            const isCancelled = apt.status === 'Cancelled'
            const isCompleted = apt.status === 'Completed'

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{apt.doctorName}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {apt.specialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{apt.clinicHospital}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isRescheduled
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <CalendarDays className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-mono font-medium">{apt.date} at {apt.time} ({apt.durationMinutes}m)</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    {apt.visitType === 'Telehealth Video' ? (
                      <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                    <span className="truncate">{apt.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">Reason: {apt.reason}</span>
                  </div>
                </div>

                {apt.preparationNotes && (
                  <div className="p-3 rounded-xl bg-teal-50/40 border border-teal-200/50 text-xs text-teal-950">
                    <span className="font-bold">Preparation &amp; Patient Notes:</span> {apt.preparationNotes}
                  </div>
                )}

                {/* Card Action Controls */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {!isCancelled && !isCompleted && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleApt(apt)
                          setRescheduleDate(apt.date)
                          setRescheduleTime(apt.time)
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 text-xs font-semibold text-slate-700 hover:text-teal-800 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => openEditModal(apt)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setCancelConfirmApt(apt)}
                        className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <CalendarX className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      onDeleteAppointment(apt.id)
                      onShowToast('Appointment Removed', 'Appointment deleted from local schedule.', 'info')
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isCancelled && (
                    <span className="text-[11px] text-rose-600 font-mono italic">
                      This visit has been marked cancelled.
                    </span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
            No clinical appointments match your current filters.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApt ? 'Edit Appointment' : 'Book Clinical Appointment (Local Demo)'}
        subtitle="Manage upcoming consultations and notes"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAppointment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Doctor Name *</label>
              <input
                type="text"
                value={formDoctor}
                onChange={(e) => setFormDoctor(e.target.value)}
                placeholder="e.g. Dr. Michael Chen, MD"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Specialty</label>
              <input
                type="text"
                value={formSpecialty}
                onChange={(e) => setFormSpecialty(e.target.value)}
                placeholder="e.g. Cardiology, Endocrinology"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time</label>
              <input
                type="text"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                placeholder="e.g. 10:30 AM"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Visit Type</label>
              <select
                value={formVisitType}
                onChange={(e) => setFormVisitType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              >
                <option value="In-Person">In-Person Consultation</option>
                <option value="Telehealth Video">Telehealth Video</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Clinic / Hospital Name</label>
              <input
                type="text"
                value={formClinic}
                onChange={(e) => setFormClinic(e.target.value)}
                placeholder="e.g. Metro Health Pavilion"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Location / Room</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Suite 420 or Video Link"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Visit Reason *</label>
            <input
              type="text"
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="e.g. 6-month lipid follow-up, routine checkup"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Preparation Notes for Patient</label>
            <textarea
              rows={2}
              value={formPrep}
              onChange={(e) => setFormPrep(e.target.value)}
              placeholder="e.g. Bring home blood pressure log, fasting 8 hours prior"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
            >
              {editingApt ? 'Save Changes' : 'Confirm Demo Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <Modal
          isOpen={true}
          onClose={() => setRescheduleApt(null)}
          title={`Reschedule: ${rescheduleApt.doctorName}`}
          subtitle="Choose an updated appointment date and time"
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                onClick={() => setRescheduleApt(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
              >
                Save New Time
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">New Time</label>
              <input
                type="text"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                placeholder="e.g. 11:15 AM"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmApt && (
        <Modal
          isOpen={true}
          onClose={() => setCancelConfirmApt(null)}
          title="Cancel This Appointment?"
          subtitle={`With ${cancelConfirmApt.doctorName}`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                onClick={() => setCancelConfirmApt(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          }
        >
          <p className="text-xs text-slate-600">
            This will mark the consultation as Cancelled in your demo session.
          </p>
        </Modal>
      )}
    </div>
  )
}
