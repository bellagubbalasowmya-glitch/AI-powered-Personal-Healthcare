import React from 'react'
import {
  Pill,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  Coffee,
} from 'lucide-react'
import type { MedicineReminder, MedicationScheduleTime } from '../../types/health'

interface UpcomingRemindersSectionProps {
  reminders?: MedicineReminder[]
  onViewAllReminders: () => void
  onAddReminder: () => void
}

export const UpcomingRemindersSection: React.FC<UpcomingRemindersSectionProps> = ({
  reminders = [],
  onViewAllReminders,
  onAddReminder,
}) => {
  const getScheduleIcon = (scheduleTime: MedicationScheduleTime) => {
    switch (scheduleTime) {
      case 'Morning':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />
      case 'Afternoon':
        return <Coffee className="w-3.5 h-3.5 text-orange-500" />
      case 'Evening':
        return <Sunset className="w-3.5 h-3.5 text-indigo-500" />
      case 'Bedtime':
        return <Moon className="w-3.5 h-3.5 text-blue-500" />
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Taken':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Taken
          </span>
        )
      case 'Missed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Missed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        )
    }
  }

  const pendingCount = reminders.filter((r) => r.status !== 'Taken').length

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Upcoming Reminders
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                {pendingCount} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prescription schedule and smart adherence tracker
            </p>
          </div>
          <button
            onClick={onViewAllReminders}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 transition-colors shrink-0"
          >
            Manage Schedule <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {reminders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {reminders.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={onViewAllReminders}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 -mx-2 px-2.5 rounded-xl transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 group-hover:scale-105 transition-all shrink-0 mt-0.5 shadow-2xs">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-800 transition-colors truncate">
                        {item.medicineName}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.prescribedDosage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {item.instructions || item.frequency}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      {getScheduleIcon(item.scheduleTime)}
                      <span>{item.scheduleTime}</span>
                      <span>•</span>
                      <span className="font-mono">{item.timeString}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
              <Pill className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                No active medication reminders
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Schedule morning, afternoon, or bedtime dosage reminders for your prescription regimen.
              </p>
            </div>
            <button
              onClick={onAddReminder}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              Add Medication Reminder
            </button>
          </div>
        )}
      </div>

      {reminders.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {pendingCount === 0
              ? 'All doses taken for today'
              : `${pendingCount} dose(s) pending today`}
          </span>
          <button
            onClick={onAddReminder}
            className="font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Reminder
          </button>
        </div>
      )}
    </div>
  )
}
