import React, { useState } from 'react'
import {
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileQuestion,
  Copy,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import type { UnknownConditionAlertItem, UncertaintyStatus } from '../types/health'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface UnknownConditionAlertProps {
  alerts: UnknownConditionAlertItem[]
  onUpdateAlert: (alert: UnknownConditionAlertItem) => void
  onShowToast: (title: string, message?: string, type?: 'success' | 'warning' | 'info' | 'error') => void
}

export const UnknownConditionAlertPage: React.FC<UnknownConditionAlertProps> = ({
  alerts,
  onUpdateAlert,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [reviewFilter, setReviewFilter] = useState<'All' | 'Pending' | 'Reviewed'>('All')
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>('alert-01')

  // Interactive uncertainty tester simulator state
  const [customTestInput, setCustomTestInput] = useState('')
  const [simulatedResult, setSimulatedResult] = useState<{
    status: UncertaintyStatus
    reason: string
    missing: string[]
    recommendation: string
  } | null>(null)

  const handleToggleReviewed = (item: UnknownConditionAlertItem) => {
    const updated: UnknownConditionAlertItem = {
      ...item,
      hasBeenReviewed: !item.hasBeenReviewed,
    }
    onUpdateAlert(updated)
    onShowToast(
      updated.hasBeenReviewed ? 'Marked as Reviewed' : 'Reopened for Clinical Review',
      `Alert for "${item.testOrFinding}" updated.`,
      'info'
    )
  }

  const handleCopyQuestions = (item: UnknownConditionAlertItem) => {
    const text = `CLINICAL INQUIRY - UNCERTAIN FINDING
Item: ${item.testOrFinding} (Source: ${item.sourceDocument})
Status: ${item.status} (${item.confidenceLabel})
Uncertainty Factor: ${item.uncertaintyReason}
Missing Context: ${item.missingParameters.join(', ')}
Discussion Note: ${item.clinicianDiscussionRecommendation}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onShowToast(
          'Discussion Questions Copied',
          'Formatted questions copied to clipboard for your next doctor consultation.',
          'success'
        )
      }).catch(() => {
        onShowToast('Questions Copied', 'Copied to clipboard.', 'info')
      })
    } else {
      onShowToast('Clipboard Unavailable', text, 'info')
    }
  }

  const runTesterSimulation = (sampleType: 'bp' | 'thyroid' | 'blur') => {
    if (sampleType === 'bp') {
      setCustomTestInput('Single reading: 138/88 mmHg measured at gym on friend’s wrist monitor.')
      setSimulatedResult({
        status: 'Needs review',
        reason: 'Isolated wrist cuff reading without documented resting period, arm elevation, or calibrated 7-day ambulatory log.',
        missing: ['Standardized seated rest duration (5 mins)', 'Upper arm cuff calibration index', 'Multi-day morning/evening series'],
        recommendation: 'Repeat measurement using a validated upper-arm cuff after 5 minutes of seated rest before drawing conclusions.',
      })
    } else if (sampleType === 'thyroid') {
      setCustomTestInput('TSH value: 4.8 (no reference units provided on scanned laboratory fragment).')
      setSimulatedResult({
        status: 'Incomplete information',
        reason: 'Reference unit is absent (μIU/mL vs mIU/L), and concurrent Free T4 and Free T3 assays are omitted.',
        missing: ['Assay measurement unit validation', 'Serum Free Thyroxine (FT4)', 'Patient symptom history & pregnancy status'],
        recommendation: 'Request full printed laboratory panel with certified reference ranges from the testing facility.',
      })
    } else {
      setCustomTestInput('Cropped smartphone photo of handwritten prescription with partial blur across dosage.')
      setSimulatedResult({
        status: 'Unable to interpret reliably',
        reason: 'Optical Character Recognition (OCR) confidence score is 34% (below safety threshold of 92%). Script contains unreadable characters.',
        missing: ['Legible doctor sign-off', 'Unambiguous drug strength (mg vs mcg)', 'Direct pharmacy confirmation'],
        recommendation: 'Do NOT guess or attempt to decipher illegible dosage. Consult the dispensing pharmacy directly.',
      })
    }
  }

  // Filtered alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.testOrFinding.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.uncertaintyReason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || alert.status === statusFilter

    const matchesReview =
      reviewFilter === 'All' ||
      (reviewFilter === 'Pending' && !alert.hasBeenReviewed) ||
      (reviewFilter === 'Reviewed' && alert.hasBeenReviewed)

    return matchesSearch && matchesStatus && matchesReview
  })

  const getStatusBadge = (status: UncertaintyStatus) => {
    switch (status) {
      case 'Needs review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Needs review
          </span>
        )
      case 'Incomplete information':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <FileQuestion className="w-3.5 h-3.5" />
            Incomplete information
          </span>
        )
      case 'Unable to interpret reliably':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Unable to interpret reliably
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Unknown-Condition Alert
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              UNCERTAINTY DETECTOR
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Detects missing, incomplete, unreadable, or unsupported data in health inputs. Strictly halts speculative clinical inferences and directs questions to healthcare providers.
          </p>
        </div>
      </div>

      {/* Ethical Safety Guardrail Card */}
      <div className="p-4 rounded-2xl bg-linear-to-r from-slate-900 via-slate-850 to-slate-800 text-white shadow-xs border border-slate-700">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Responsible AI Standard: Zero Speculative Diagnoses
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Unlike consumer AI tools that may fabricate diagnoses or unsupported risk scores from vague inputs, HealthTwin AI adheres to strict clinical boundary checks. When laboratory baselines, fasting periods, or image resolutions are deficient, the engine flags the ambiguity with full transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Active Uncertainty Flags</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{alerts.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Identified across records</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Needs Review</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {alerts.filter((a) => a.status === 'Needs review').length}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Requires physician context</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Incomplete Information</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">
            {alerts.filter((a) => a.status === 'Incomplete information').length}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Missing required analytes</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Unable to Interpret Reliably</div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {alerts.filter((a) => a.status === 'Unable to interpret reliably').length}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Quality/resolution barriers</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts, findings, or reasons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Needs review">Needs review</option>
            <option value="Incomplete information">Incomplete information</option>
            <option value="Unable to interpret reliably">Unable to interpret reliably</option>
          </select>

          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value as 'All' | 'Pending' | 'Reviewed')}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Review States</option>
            <option value="Pending">Pending Review</option>
            <option value="Reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Main Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No matching uncertainty alerts found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or search query.</p>
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isExpanded = expandedAlertId === item.id

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  item.hasBeenReviewed
                    ? 'border-slate-200 bg-slate-50/50 opacity-90'
                    : 'border-amber-300/80 hover:border-amber-400'
                }`}
              >
                {/* Alert Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {item.confidenceLabel}
                      </span>
                      {item.hasBeenReviewed && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Reviewed by Patient
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {item.testOrFinding}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Source: <strong className="text-slate-700">{item.sourceDocument}</strong></span>
                      <span>•</span>
                      <span>Flagged: {item.detectionDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => handleToggleReviewed(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        item.hasBeenReviewed
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.hasBeenReviewed ? 'Re-open Flag' : 'Mark Reviewed'}
                    </button>

                    <button
                      onClick={() => setExpandedAlertId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                      title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
                    {/* Reason Why Information is Uncertain */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                        Why This Cannot Be Interpreted Reliably
                      </h4>
                      <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        {item.uncertaintyReason}
                      </p>
                    </div>

                    {/* Missing Parameters */}
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                        Missing or Unverified Clinical Parameters
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.missingParameters.map((param, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 flex items-center gap-2"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-medium">{param}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinician Recommendation & Copy */}
                    <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-teal-950 text-xs">
                          Suggested Discussion Points with Your Doctor
                        </h4>
                        <button
                          onClick={() => handleCopyQuestions(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-800 text-[11px] font-semibold hover:bg-teal-50"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Questions
                        </button>
                      </div>
                      <p className="text-teal-900 leading-relaxed">
                        {item.clinicianDiscussionRecommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Interactive Uncertainty Engine Tester (Hackathon Live Demo) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">
            Interactive Uncertainty Engine Simulator
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
            LIVE DEMO TOOL
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Try demonstration scenarios to see how HealthTwin AI halts inferences when data is ambiguous, blurry, or missing key baselines:
        </p>

        {/* Sample Pre-set Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runTesterSimulation('bp')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Scenario 1: Isolated Gym BP Reading
          </button>
          <button
            onClick={() => runTesterSimulation('thyroid')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Scenario 2: Thyroid Panel Missing Units
          </button>
          <button
            onClick={() => runTesterSimulation('blur')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Scenario 3: Low-Resolution Rx Scan
          </button>
        </div>

        {customTestInput && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Simulated Input: </span>
            <span className="text-slate-600 italic">&ldquo;{customTestInput}&rdquo;</span>
          </div>
        )}

        {simulatedResult && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-wide">
                Engine Decision: {simulatedResult.status}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Safe Boundary Enforced
              </span>
            </div>

            <p className="text-slate-300">
              <strong className="text-white">Reason:</strong> {simulatedResult.reason}
            </p>

            <div>
              <span className="text-white font-semibold">Missing Essential Context:</span>
              <ul className="list-disc list-inside text-slate-300 mt-1 space-y-0.5">
                {simulatedResult.missing.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800 text-emerald-400">
              <strong>Guardrail:</strong> {simulatedResult.recommendation}
            </div>
          </div>
        )}

        {simulatedResult && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setCustomTestInput('')
                setSimulatedResult(null)
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Simulator
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
