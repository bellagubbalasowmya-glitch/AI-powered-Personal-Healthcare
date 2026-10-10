import React, { useState } from 'react'
import {
  Activity,
  Droplets,
  Moon,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Footprints,
  Heart,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { DailyWellnessEntry, HabitItem } from '../types/health'
import { Modal } from '../components/common/Modal'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'
import {
  WELLNESS_SUMMARY_METRICS,
  SIMULATED_WEARABLE_NOTE,
  MOCK_INTRADAY_HEART_RATE,
  MOCK_STEPS_30_DAYS,
  MOCK_SLEEP_30_DAYS,
  MOCK_ACTIVITY_30_DAYS,
} from '../data/mockWellness'
import { WellnessMetricCard } from '../components/wellness/WellnessMetricCard'
import { HeartRateChart } from '../components/wellness/HeartRateChart'
import { StepCountChart } from '../components/wellness/StepCountChart'
import { SleepChart } from '../components/wellness/SleepChart'
import { ActivityChart } from '../components/wellness/ActivityChart'
import { WellnessTrendsSummary } from '../components/wellness/WellnessTrendsSummary'

interface WellnessTrackerProps {
  logs: DailyWellnessEntry[]
  onAddLog: (entry: DailyWellnessEntry) => void
  onUpdateLog: (entry: DailyWellnessEntry) => void
  onDeleteLog: (id: string) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h1', name: '30-minute Cardiovascular Walk', category: 'activity', completed: false },
  { id: 'h2', name: 'Drank 8 Glasses of Water', category: 'hydration', completed: false },
  { id: 'h3', name: '10-minute Mindful Breathing', category: 'mindfulness', completed: false },
  { id: 'h4', name: 'Took Evening Medication', category: 'nutrition', completed: false },
  { id: 'h5', name: 'Screen-Free 30m Before Bed', category: 'sleep', completed: false },
]

export const WellnessTrackerPage: React.FC<WellnessTrackerProps> = ({
  logs,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'dailyTracker' | 'wearables'>('dailyTracker')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [stepDays, setStepDays] = useState<number>(14)

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formSleepHours, setFormSleepHours] = useState(7.5)
  const [formSleepQuality, setFormSleepQuality] = useState<'Restful' | 'Moderate' | 'Restless'>('Restful')
  const [formWaterGlasses, setFormWaterGlasses] = useState(8)
  const [formWaterTarget, setFormWaterTarget] = useState(8)
  const [formActiveMinutes, setFormActiveMinutes] = useState(45)
  const [formMoodNote, setFormMoodNote] = useState('')
  const [formHabits, setFormHabits] = useState<HabitItem[]>(DEFAULT_HABITS)

  // Quick hydration for today's entry
  const todayEntry = logs[0]

  const handleQuickWaterChange = (delta: number) => {
    if (!todayEntry) return
    const newCount = Math.max(0, todayEntry.waterGlasses + delta)
    const updatedEntry: DailyWellnessEntry = {
      ...todayEntry,
      waterGlasses: newCount,
      habits: todayEntry.habits.map((h) =>
        h.category === 'hydration' ? { ...h, completed: newCount >= todayEntry.waterTarget } : h
      ),
    }
    onUpdateLog(updatedEntry)
    onShowToast(
      'Hydration Updated',
      `${delta > 0 ? '+1 Glass logged' : '-1 Glass adjusted'}. Current: ${newCount} of ${todayEntry.waterTarget} glasses.`,
      'info'
    )
  }

  const handleToggleTodayHabit = (habitId: string) => {
    if (!todayEntry) return
    const updatedHabits = todayEntry.habits.map((h) =>
      h.id === habitId ? { ...h, completed: !h.completed } : h
    )
    const updatedEntry: DailyWellnessEntry = {
      ...todayEntry,
      habits: updatedHabits,
    }
    onUpdateLog(updatedEntry)
    onShowToast('Habit Updated', 'Daily habit status saved.', 'info')
  }

  const handleOpenAddModal = () => {
    setEditingLogId(null)
    setFormDate(new Date().toISOString().split('T')[0])
    setFormSleepHours(7.5)
    setFormSleepQuality('Restful')
    setFormWaterGlasses(8)
    setFormWaterTarget(8)
    setFormActiveMinutes(45)
    setFormMoodNote('')
    setFormHabits(DEFAULT_HABITS.map((h) => ({ ...h, completed: false })))
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (entry: DailyWellnessEntry) => {
    setEditingLogId(entry.id)
    setFormDate(entry.date)
    setFormSleepHours(entry.sleepHours)
    setFormSleepQuality(entry.sleepQuality)
    setFormWaterGlasses(entry.waterGlasses)
    setFormWaterTarget(entry.waterTarget)
    setFormActiveMinutes(entry.activeMinutes)
    setFormMoodNote(entry.moodNote || '')
    setFormHabits(entry.habits)
    setIsModalOpen(true)
  }

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingLogId) {
      const updated: DailyWellnessEntry = {
        id: editingLogId,
        date: formDate,
        sleepHours: Number(formSleepHours),
        sleepQuality: formSleepQuality,
        waterGlasses: Number(formWaterGlasses),
        waterTarget: Number(formWaterTarget),
        activeMinutes: Number(formActiveMinutes),
        habits: formHabits,
        moodNote: formMoodNote.trim() || undefined,
      }
      onUpdateLog(updated)
      onShowToast('Wellness Log Updated', `Entry for ${formDate} saved.`, 'success')
    } else {
      const newEntry: DailyWellnessEntry = {
        id: `wlog-${Date.now()}`,
        date: formDate,
        sleepHours: Number(formSleepHours),
        sleepQuality: formSleepQuality,
        waterGlasses: Number(formWaterGlasses),
        waterTarget: Number(formWaterTarget),
        activeMinutes: Number(formActiveMinutes),
        habits: formHabits,
        moodNote: formMoodNote.trim() || undefined,
      }
      onAddLog(newEntry)
      onShowToast('Wellness Log Added', `Daily check-in for ${formDate} recorded.`, 'success')
    }
    setIsModalOpen(false)
  }

  const handleDeleteEntry = (id: string) => {
    onDeleteLog(id)
    setDeleteConfirmId(null)
    onShowToast('Entry Removed', 'Daily wellness log deleted.', 'info')
  }

  // Chart data preparing from logs
  const chartData = [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      sleep: log.sleepHours,
      water: log.waterGlasses,
      targetWater: log.waterTarget,
      active: log.activeMinutes,
    }))

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Personalized Wellness Tracker
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
              HABITS &amp; WEARABLES
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Track daily sleep, hydration, activity minutes, and lifestyle habits. Includes weekly progress trends and gentle non-clinical wellness suggestions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Log Daily Check-in
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('dailyTracker')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'dailyTracker'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Habits &amp; Progress
        </button>
        <button
          onClick={() => setActiveTab('wearables')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'wearables'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Wearables Telemetry Stream
        </button>
      </div>

      {activeTab === 'dailyTracker' && (
        <div className="space-y-6">
          {/* Quick Today's Snapshot Banner */}
          {todayEntry && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hydration Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Hydration</h3>
                      <p className="text-[11px] text-slate-500">Target: {todayEntry.waterTarget} Glasses (2L)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700">
                    {Math.round((todayEntry.waterGlasses / todayEntry.waterTarget) * 100)}%
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {todayEntry.waterGlasses}
                  </span>
                  <span className="text-xs text-slate-500">/ {todayEntry.waterTarget} glasses</span>
                </div>

                {/* Glass Indicator Dots */}
                <div className="flex gap-1.5 mb-4">
                  {Array.from({ length: todayEntry.waterTarget }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full transition-colors ${
                        i < todayEntry.waterGlasses ? 'bg-cyan-500' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickWaterChange(1)}
                    className="flex-1 py-1.5 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    +1 Glass (250ml)
                  </button>
                  <button
                    onClick={() => handleQuickWaterChange(-1)}
                    disabled={todayEntry.waterGlasses <= 0}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-xs transition-colors disabled:opacity-40"
                  >
                    -1
                  </button>
                </div>
              </div>

              {/* Sleep Log Snapshot */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Last Night&apos;s Sleep</h3>
                      <p className="text-[11px] text-slate-500">Sleep Duration &amp; Quality</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      todayEntry.sleepQuality === 'Restful'
                        ? 'bg-emerald-50 text-emerald-700'
                        : todayEntry.sleepQuality === 'Moderate'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {todayEntry.sleepQuality}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {todayEntry.sleepHours}
                  </span>
                  <span className="text-xs text-slate-500">hours</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {todayEntry.moodNote || 'Circadian timing stable. Morning alertness baseline normal.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Target: 7-9 hrs</span>
                  <span className="font-semibold text-indigo-600">Within Optimal Range</span>
                </div>
              </div>

              {/* Today's Habits Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Daily Habits</h3>
                      <p className="text-[11px] text-slate-500">Interactive Checklist</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    {todayEntry.habits.filter((h) => h.completed).length} / {todayEntry.habits.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {todayEntry.habits.map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => handleToggleTodayHabit(habit.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors border text-left ${
                        habit.completed
                          ? 'bg-teal-50/70 border-teal-200 text-teal-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{habit.name}</span>
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          habit.completed ? 'text-teal-600' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weekly Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Weekly Sleep &amp; Activity (Minutes)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of daily sleep duration against physical activity
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="sleep" name="Sleep (Hours)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="active" name="Active (Mins)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Hydration vs Daily Target
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Measured in standard 250ml glasses per day
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 12]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="water" name="Drank (Glasses)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="targetWater" name="Target (8 Glasses)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gentle General Wellness Suggestions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">
                Gentle Lifestyle &amp; Wellness Insights
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                NON-CLINICAL
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              General evidence-backed lifestyle observations generated from your logged sleep, hydration, and movement patterns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  Circadian Regularity
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Your bedtime has stayed within a 35-minute window over the last 4 days. Maintaining regular bed and wake times strengthens sleep architecture.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  Hydration Pacing
                </div>
                <p className="text-slate-600 leading-relaxed">
                  You reached your 8-glass water target 3 out of 4 recorded days. For comfortable sleep, try finishing your main hydration by 7:30 PM.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Movement Continuity
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Your average active duration is 47.5 minutes, comfortably meeting general cardio guidelines. Light walking after meals supports glycemic balance.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
              <strong>Wellness Advisory:</strong> These gentle suggestions are general lifestyle tips and not diagnostic medical prescriptions or therapeutic interventions. Consult your physician for medical care.
            </div>
          </div>

          {/* Historical Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Logged Wellness Entries</h3>
                <p className="text-xs text-slate-500">Historical check-ins with edit and remove options</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Sleep</th>
                    <th className="py-3 px-4 font-semibold">Hydration</th>
                    <th className="py-3 px-4 font-semibold">Active</th>
                    <th className="py-3 px-4 font-semibold">Habits Completed</th>
                    <th className="py-3 px-4 font-semibold">Notes</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{log.sleepHours} hrs</span>
                        <span className="ml-1.5 text-[10px] text-slate-500">({log.sleepQuality})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-cyan-700">{log.waterGlasses}</span>
                        <span className="text-slate-400"> / {log.waterTarget} gl</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {log.activeMinutes} mins
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                          {log.habits.filter((h) => h.completed).length} / {log.habits.length}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {log.moodNote || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(log)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEARABLES TELEMETRY STREAM */}
      {activeTab === 'wearables' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-bold">Notice:</strong> &ldquo;{SIMULATED_WEARABLE_NOTE}&rdquo; HealthTwin AI does not monitor live hardware in this hackathon demo, does not diagnose medical conditions, and does not recommend medication modifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <WellnessMetricCard
              title="Resting Heart Rate"
              value={WELLNESS_SUMMARY_METRICS.restingHeartRate.value}
              unit={WELLNESS_SUMMARY_METRICS.restingHeartRate.unit}
              statusNote={WELLNESS_SUMMARY_METRICS.restingHeartRate.status}
              trendChange={WELLNESS_SUMMARY_METRICS.restingHeartRate.change}
              icon={Heart}
              colorClass="text-rose-600"
              bgClass="bg-rose-50"
            />
            <WellnessMetricCard
              title="Daily Steps Avg"
              value={WELLNESS_SUMMARY_METRICS.dailyStepsAvg.value.toLocaleString()}
              unit={WELLNESS_SUMMARY_METRICS.dailyStepsAvg.unit}
              statusNote={WELLNESS_SUMMARY_METRICS.dailyStepsAvg.status}
              trendChange={WELLNESS_SUMMARY_METRICS.dailyStepsAvg.change}
              icon={Footprints}
              colorClass="text-teal-700"
              bgClass="bg-teal-50"
            />
            <WellnessMetricCard
              title="Sleep Duration"
              value={WELLNESS_SUMMARY_METRICS.sleepDurationAvg.value}
              unit={WELLNESS_SUMMARY_METRICS.sleepDurationAvg.unit}
              statusNote={WELLNESS_SUMMARY_METRICS.sleepDurationAvg.status}
              trendChange={WELLNESS_SUMMARY_METRICS.sleepDurationAvg.change}
              icon={Moon}
              colorClass="text-indigo-700"
              bgClass="bg-indigo-50"
            />
            <WellnessMetricCard
              title="Active Minutes"
              value={WELLNESS_SUMMARY_METRICS.activeMinutesAvg.value}
              unit={WELLNESS_SUMMARY_METRICS.activeMinutesAvg.unit}
              statusNote={WELLNESS_SUMMARY_METRICS.activeMinutesAvg.status}
              trendChange={WELLNESS_SUMMARY_METRICS.activeMinutesAvg.change}
              icon={Zap}
              colorClass="text-amber-700"
              bgClass="bg-amber-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeartRateChart data={MOCK_INTRADAY_HEART_RATE} />
            <StepCountChart
              data={MOCK_STEPS_30_DAYS}
              daysCount={stepDays}
              onDaysChange={setStepDays}
            />
            <SleepChart data={MOCK_SLEEP_30_DAYS} />
            <ActivityChart data={MOCK_ACTIVITY_30_DAYS} />
          </div>
          <WellnessTrendsSummary />
        </div>
      )}

      {/* ADD / EDIT ENTRY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLogId ? 'Edit Wellness Check-in' : 'New Daily Wellness Check-in'}
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sleep Quality
              </label>
              <select
                value={formSleepQuality}
                onChange={(e) =>
                  setFormSleepQuality(e.target.value as 'Restful' | 'Moderate' | 'Restless')
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="Restful">Restful</option>
                <option value="Moderate">Moderate</option>
                <option value="Restless">Restless</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sleep (Hours)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                required
                value={formSleepHours}
                onChange={(e) => setFormSleepHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Water (Glasses)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={formWaterGlasses}
                onChange={(e) => setFormWaterGlasses(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active (Mins)
              </label>
              <input
                type="number"
                min="0"
                max="600"
                required
                value={formActiveMinutes}
                onChange={(e) => setFormActiveMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Habits Completed
            </label>
            <div className="space-y-2">
              {formHabits.map((habit, idx) => (
                <label
                  key={habit.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={(e) => {
                      const updated = [...formHabits]
                      updated[idx] = { ...updated[idx], completed: e.target.checked }
                      setFormHabits(updated)
                    }}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-800">{habit.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Mood &amp; Notes
            </label>
            <textarea
              rows={2}
              value={formMoodNote}
              onChange={(e) => setFormMoodNote(e.target.value)}
              placeholder="e.g. Energy felt steady, hydration target achieved before dinner."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
            >
              {editingLogId ? 'Save Changes' : 'Record Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Remove Wellness Entry"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove this daily wellness entry? This action only alters your local demonstration session.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmId && handleDeleteEntry(deleteConfirmId)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
