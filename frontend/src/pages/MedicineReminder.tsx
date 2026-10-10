import React, { useState } from 'react'
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import type { MedicineReminder, MedicationScheduleTime, ReminderStatus } from '../types/health'
import { Modal } from '../components/common/Modal'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface MedicineReminderProps {
  reminders: MedicineReminder[]
  onAddReminder: (reminder: MedicineReminder) => void
  onUpdateReminder: (reminder: MedicineReminder) => void
  onDeleteReminder: (id: string) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

export const MedicineReminderPage: React.FC<MedicineReminderProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<string>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<MedicineReminder | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDosage, setFormDosage] = useState('')
  const [formSchedule, setFormSchedule] = useState<MedicationScheduleTime>('Morning')
  const [formTimeString, setFormTimeString] = useState('08:00 AM')
  const [formFrequency, setFormFrequency] = useState('Once Daily')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState('')
  const [formInstructions, setFormInstructions] = useState('')

  const openAddModal = () => {
    setEditingReminder(null)
    setFormName('')
    setFormDosage('')
    setFormSchedule('Morning')
    setFormTimeString('08:00 AM')
    setFormFrequency('Once Daily')
    setFormStartDate(new Date().toISOString().split('T')[0])
    setFormEndDate('')
    setFormInstructions('')
    setIsModalOpen(true)
  }

  const openEditModal = (rem: MedicineReminder) => {
    setEditingReminder(rem)
    setFormName(rem.medicineName)
    setFormDosage(rem.prescribedDosage)
    setFormSchedule(rem.scheduleTime)
    setFormTimeString(rem.timeString)
    setFormFrequency(rem.frequency)
    setFormStartDate(rem.startDate)
    setFormEndDate(rem.endDate || '')
    setFormInstructions(rem.instructions)
    setIsModalOpen(true)
  }

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formDosage.trim()) {
      onShowToast('Validation Error', 'Please enter medicine name and prescribed dosage.', 'warning')
      return
    }

    if (editingReminder) {
      const updated: MedicineReminder = {
        ...editingReminder,
        medicineName: formName.trim(),
        prescribedDosage: formDosage.trim(),
        scheduleTime: formSchedule,
        timeString: formTimeString,
        frequency: formFrequency,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
        instructions: formInstructions.trim(),
      }
      onUpdateReminder(updated)
      onShowToast('Reminder Updated', `Updated schedule for ${updated.medicineName}.`, 'success')
    } else {
      const newRem: MedicineReminder = {
        id: `rem-${Date.now()}`,
        medicineName: formName.trim(),
        prescribedDosage: formDosage.trim(),
        scheduleTime: formSchedule,
        timeString: formTimeString,
        frequency: formFrequency,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
        instructions: formInstructions.trim() || 'Take as prescribed by doctor.',
        status: 'Pending',
      }
      onAddReminder(newRem)
      onShowToast('Reminder Added', `Added reminder for ${newRem.medicineName}.`, 'success')
    }

    setIsModalOpen(false)
  }

  const handleToggleStatus = (rem: MedicineReminder, nextStatus: ReminderStatus) => {
    const updated: MedicineReminder = {
      ...rem,
      status: nextStatus,
      lastTakenTimestamp: nextStatus === 'Taken' ? `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined,
    }
    onUpdateReminder(updated)
    onShowToast(
      nextStatus === 'Taken' ? 'Dose Marked Taken' : nextStatus === 'Missed' ? 'Dose Marked Missed' : 'Status Reset',
      `${rem.medicineName} is now marked as ${nextStatus.toLowerCase()}.`,
      nextStatus === 'Taken' ? 'success' : 'info'
    )
  }

  const handleDelete = (id: string) => {
    onDeleteReminder(id)
    setDeleteConfirmId(null)
    onShowToast('Reminder Removed', 'The medication reminder was deleted from your local session.', 'info')
  }

  // Statistics
  const totalMeds = reminders.length
  const takenCount = reminders.filter((r) => r.status === 'Taken').length
  const missedCount = reminders.filter((r) => r.status === 'Missed').length
  const pendingCount = reminders.filter((r) => r.status === 'Pending').length
  const adherenceRate = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0

  // Filtered Reminders
  const filteredReminders = reminders.filter((r) => {
    const matchesSearch =
      r.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.prescribedDosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.instructions.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSchedule = selectedSchedule === 'All' || r.scheduleTime === selectedSchedule

    return matchesSearch && matchesSchedule
  })

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Smart Medicine Reminder
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              ADHERENCE COPILOT
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Track daily schedules, log adherence, and manage physician-prescribed dosage schedules.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Safety Notice: Never Recommend Dosages */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Clinical Safety Rule:</strong> HealthTwin AI never generates, recommends, or alters medication dosages. All reminder entries must strictly reflect instructions provided by your licensed healthcare provider.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Today&apos;s Adherence
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{adherenceRate}%</span>
            <span className="text-xs text-slate-400 font-medium">({takenCount}/{totalMeds})</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${adherenceRate}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Doses Taken
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{takenCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Confirmed for today</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Doses Pending
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled upcoming</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Missed / Overdue
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{missedCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded missed doses</span>
        </div>
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
              placeholder="Search reminder by medicine name, dosage, or note..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['All', 'Morning', 'Afternoon', 'Evening', 'Bedtime'].map((sched) => (
              <button
                key={sched}
                onClick={() => setSelectedSchedule(sched)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedSchedule === sched
                    ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {sched}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((rem) => {
            const isTaken = rem.status === 'Taken'
            const isMissed = rem.status === 'Missed'

            return (
              <div
                key={rem.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isTaken
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : isMissed
                    ? 'border-rose-200/80 bg-rose-50/20'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-700'
                        : isMissed
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{rem.medicineName}</h3>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rem.prescribedDosage}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rem.timeString} ({rem.scheduleTime})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rem.instructions}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                      <span>Frequency: {rem.frequency}</span>
                      <span>&bull;</span>
                      <span>From: {rem.startDate} {rem.endDate ? `to ${rem.endDate}` : '(Ongoing)'}</span>
                      {rem.lastTakenTimestamp && (
                        <>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-semibold">{rem.lastTakenTimestamp}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleToggleStatus(rem, 'Taken')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isTaken
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Taken</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rem, 'Pending')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        rem.status === 'Pending'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-amber-700'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rem, 'Missed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isMissed
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Missed</span>
                    </button>
                  </div>

                  {/* Edit & Delete */}
                  <button
                    onClick={() => openEditModal(rem)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                    title="Edit Reminder"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
            No medication reminders match your search or filter.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReminder ? 'Edit Medicine Reminder' : 'Add Prescribed Medicine Reminder'}
        subtitle="Reminder adherence tracking — strictly reflects doctor prescription"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveReminder} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-900 text-[11px] leading-relaxed">
            Please enter medicine details exactly as prescribed on your doctor&apos;s slip or pharmacy container.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Medicine Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Atorvastatin, Metformin"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prescribed Dosage *</label>
              <input
                type="text"
                value={formDosage}
                onChange={(e) => setFormDosage(e.target.value)}
                placeholder="e.g. 10 mg tablet, 500 mg"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Schedule Window</label>
              <select
                value={formSchedule}
                onChange={(e) => setFormSchedule(e.target.value as MedicationScheduleTime)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Bedtime">Bedtime</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Time</label>
              <input
                type="text"
                value={formTimeString}
                onChange={(e) => setFormTimeString(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Frequency</label>
              <input
                type="text"
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                placeholder="e.g. Once Daily, With Food"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                placeholder="Leave blank if continuous"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Doctor Instructions / Food Notes</label>
            <textarea
              rows={2}
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="e.g. Take with a glass of water after breakfast. Avoid grapefruit."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
              {editingReminder ? 'Save Changes' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Medication Reminder?"
          subtitle="This action removes the reminder from your local session"
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Keep Reminder
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-xs text-slate-600">
            Are you sure you want to delete this medication reminder? You can add it back at any time.
          </p>
        </Modal>
      )}
    </div>
  )
}
