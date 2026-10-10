import React, { useState } from 'react'
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import type { VitalMeasurement } from '../types/health'
import { Modal } from '../components/common/Modal'

interface VitalsMonitoringProps {
  vitals: VitalMeasurement[]
  onAddVital: (vital: VitalMeasurement) => void
  onDeleteVital: (id: string) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

export const VitalsMonitoringPage: React.FC<VitalsMonitoringProps> = ({
  vitals,
  onAddVital,
  onDeleteVital,
  onShowToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'bp' | 'pulse' | 'spo2' | 'temp'>('bp')

  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formTime, setFormTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  const [formSystolic, setFormSystolic] = useState('120')
  const [formDiastolic, setFormDiastolic] = useState('80')
  const [formPulse, setFormPulse] = useState('72')
  const [formTemp, setFormTemp] = useState('98.6')
  const [formSpO2, setFormSpO2] = useState('98')
  const [formNotes, setFormNotes] = useState('Resting sitting position')

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault()

    const sys = parseInt(formSystolic, 10)
    const dia = parseInt(formDiastolic, 10)
    const pul = parseInt(formPulse, 10)
    const spo2 = parseInt(formSpO2, 10)
    const temp = parseFloat(formTemp)

    if (isNaN(sys) || isNaN(dia) || isNaN(pul) || isNaN(spo2) || isNaN(temp)) {
      onShowToast('Validation Error', 'Please enter valid numerical readings.', 'warning')
      return
    }

    let alertMsg: string | undefined
    let isCautious = false

    if (sys >= 130 || dia >= 85) {
      alertMsg = `Systolic reading (${sys} mmHg) or Diastolic (${dia} mmHg) is elevated above standard 120/80 mmHg resting baseline. Observe resting reading; discuss persistent trends with your doctor.`
      isCautious = true
    } else if (spo2 < 95) {
      alertMsg = `SpO2 reading (${spo2}%) is below the typical 95% threshold. Ensure sensor contact and verify with medical equipment.`
      isCautious = true
    } else if (temp >= 100.4) {
      alertMsg = `Temperature (${temp}°F) is in the low-grade febrile range. Ensure adequate hydration and rest.`
      isCautious = true
    }

    const newVital: VitalMeasurement = {
      id: `vit-${Date.now()}`,
      date: formDate,
      time: formTime,
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      temperature: temp,
      temperatureUnit: '°F',
      oxygenSaturation: spo2,
      notes: formNotes.trim(),
      cautiousAlert: alertMsg,
      isCautious,
    }

    onAddVital(newVital)
    setIsAddModalOpen(false)
    onShowToast('Vitals Recorded', `Logged blood pressure ${sys}/${dia} mmHg and pulse ${pul} bpm.`, 'success')
  }

  const handleDelete = (id: string) => {
    onDeleteVital(id)
    setDeleteConfirmId(null)
    onShowToast('Reading Removed', 'Vital measurement entry deleted from local session.', 'info')
  }

  // Chronologically sorted for chart
  const sortedVitalsForChart = [...vitals].sort(
    (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
  )

  const latestVital = vitals[0] || null

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Health Vitals Monitoring
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              PHYSIOMETRIC TRENDS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Log and review longitudinal blood pressure, pulse rate, oxygen saturation, and body temperature.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Vitals Reading</span>
        </button>
      </div>

      {/* Informational Alert Guardrail Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Informational Observation Only:</strong> Vitals alerts shown are general references based on standard physiological guidelines. They do not diagnose hypertension, hypoxia, or any acute disease.
        </p>
      </div>

      {/* Latest Vitals Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Blood Pressure
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {latestVital ? `${latestVital.systolic}/${latestVital.diastolic}` : '-- / --'}
            </span>
            <span className="text-xs text-slate-500 font-medium">mmHg</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {latestVital ? `Latest: ${latestVital.date}` : 'No readings yet'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pulse Rate
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {latestVital ? `${latestVital.pulse}` : '--'}
            </span>
            <span className="text-xs text-slate-500 font-medium">bpm</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {latestVital ? 'Resting baseline range' : 'No readings yet'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Oxygen Saturation
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {latestVital ? `${latestVital.oxygenSaturation}%` : '--%'}
            </span>
            <span className="text-xs text-slate-500 font-medium">SpO2</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {latestVital ? 'Optimal arterial saturation' : 'No readings yet'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Body Temperature
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {latestVital ? `${latestVital.temperature}` : '--'}
            </span>
            <span className="text-xs text-slate-500 font-medium">{latestVital ? (latestVital.temperatureUnit || '°F') : '°F'}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {latestVital ? 'Normothermic reading' : 'No readings yet'}
          </span>
        </div>
      </div>

      {/* Recharts Historical Charts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Historical Vitals Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-day tracked biometric measurements
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('bp')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'bp'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setActiveTab('pulse')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'pulse'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pulse (bpm)
            </button>
            <button
              onClick={() => setActiveTab('spo2')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'spo2'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oxygen (SpO2)
            </button>
            <button
              onClick={() => setActiveTab('temp')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'temp'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temperature
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-64 w-full">
          {sortedVitalsForChart.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No vitals logged yet. Click &ldquo;Log Vitals Reading&rdquo; to begin tracking trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'bp' ? (
              <LineChart data={sortedVitalsForChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[60, 160]} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" mmHg" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as VitalMeasurement
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-xl">
                          <span className="font-mono text-[11px] text-slate-400">{item.date} ({item.time})</span>
                          <div className="font-bold text-rose-300">Systolic: {item.systolic} mmHg</div>
                          <div className="font-bold text-sky-300">Diastolic: {item.diastolic} mmHg</div>
                          {item.notes && <p className="text-[11px] text-slate-300">{item.notes}</p>}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine y={120} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Normal Systolic 120', fill: '#f43f5e', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#0ea5e9" strokeDasharray="4 4" label={{ value: 'Normal Diastolic 80', fill: '#0ea5e9', fontSize: 10 }} />
                <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} name="Diastolic" />
              </LineChart>
            ) : activeTab === 'pulse' ? (
              <LineChart data={sortedVitalsForChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[50, 110]} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" bpm" />
                <Tooltip />
                <ReferenceLine y={60} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Resting Min (60)', fill: '#94a3b8', fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Resting Max (100)', fill: '#94a3b8', fontSize: 10 }} />
                <Line type="monotone" dataKey="pulse" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} name="Pulse bpm" />
              </LineChart>
            ) : activeTab === 'spo2' ? (
              <LineChart data={sortedVitalsForChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[90, 100]} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                <Tooltip />
                <ReferenceLine y={95} stroke="#0284c7" strokeDasharray="4 4" label={{ value: 'Normal Threshold 95%', fill: '#0284c7', fontSize: 10 }} />
                <Line type="monotone" dataKey="oxygenSaturation" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} name="SpO2 %" />
              </LineChart>
            ) : (
              <LineChart data={sortedVitalsForChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[97.0, 101.0]} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit="°F" />
                <Tooltip />
                <ReferenceLine y={98.6} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Baseline 98.6°F', fill: '#f59e0b', fontSize: 10 }} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Temp °F" />
              </LineChart>
            )}
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Historical Measurements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recorded Measurements Log</h3>
          <span className="text-xs text-slate-400 font-mono">{vitals.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Pulse</th>
                <th className="py-3 px-4">SpO2</th>
                <th className="py-3 px-4">Temp</th>
                <th className="py-3 px-4">Clinical Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {vitals.length > 0 ? (
                vitals.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {v.date} <span className="text-slate-400 text-[11px]">({v.time})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${v.systolic >= 130 ? 'text-amber-700' : 'text-slate-900'}`}>
                        {v.systolic}/{v.diastolic} mmHg
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{v.pulse} bpm</td>
                    <td className="py-3 px-4 font-mono">{v.oxygenSaturation}%</td>
                    <td className="py-3 px-4 font-mono">{v.temperature} {v.temperatureUnit}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs">
                      {v.cautiousAlert ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {v.cautiousAlert}
                        </span>
                      ) : (
                        v.notes || 'Normal'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteConfirmId(v.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Reading"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No vitals entries logged yet. Click &ldquo;Log Vitals Reading&rdquo; to add your first reading.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Measurement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Vital Measurement"
        subtitle="Record blood pressure, pulse, oxygen saturation, or temperature"
        maxWidth="md"
      >
        <form onSubmit={handleSaveVital} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time</label>
              <input
                type="text"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              Blood Pressure (mmHg)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Systolic (Top)</label>
                <input
                  type="number"
                  value={formSystolic}
                  onChange={(e) => setFormSystolic(e.target.value)}
                  placeholder="120"
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Diastolic (Bottom)</label>
                <input
                  type="number"
                  value={formDiastolic}
                  onChange={(e) => setFormDiastolic(e.target.value)}
                  placeholder="80"
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={formPulse}
                onChange={(e) => setFormPulse(e.target.value)}
                placeholder="72"
                required
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={formSpO2}
                onChange={(e) => setFormSpO2(e.target.value)}
                placeholder="98"
                required
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={formTemp}
                onChange={(e) => setFormTemp(e.target.value)}
                placeholder="98.6"
                required
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Measurement Context / Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Seated 5 minutes rest, post-morning walk"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
            >
              Save Vitals
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Vitals Reading?"
          subtitle="Remove this measurement from your history log"
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
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
            Are you sure you want to remove this vitals entry?
          </p>
        </Modal>
      )}
    </div>
  )
}
