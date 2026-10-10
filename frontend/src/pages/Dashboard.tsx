import React from 'react'
import {
  FileText,
  FileCheck,
  HeartPulse,
  Pill,
  UploadCloud,
  Bot,
} from 'lucide-react'
import { MetricCard } from '../components/common/MetricCard'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'
import { DigitalTwinExplainer } from '../components/dashboard/DigitalTwinExplainer'
import { HealthGlanceCard } from '../components/dashboard/HealthGlanceCard'
import { RecentRecordsSection } from '../components/dashboard/RecentRecordsSection'
import { UpcomingRemindersSection } from '../components/dashboard/UpcomingRemindersSection'
import { RecentActivityList } from '../components/dashboard/RecentActivityList'
import { QuickActions } from '../components/dashboard/QuickActions'
import type { MedicalRecord, TimelineEvent, MedicineReminder, VitalMeasurement } from '../types/health'
import type { NavPage } from '../components/layout/Sidebar'

export interface DashboardPageProps {
  records: MedicalRecord[]
  timelineEvents: TimelineEvent[]
  reminders?: MedicineReminder[]
  vitals?: VitalMeasurement[]
  onNavigate: (page: NavPage) => void
  onOpenUpload: () => void
  onSelectEvent: (event: TimelineEvent) => void
  onSelectRecord?: (record: MedicalRecord) => void
}

export const Dashboard: React.FC<DashboardPageProps> = ({
  records,
  timelineEvents,
  reminders = [],
  vitals = [],
  onNavigate,
  onOpenUpload,
  onSelectEvent,
  onSelectRecord,
}) => {
  // 1. Compute stats
  const labReportsCount = records.filter(
    (r) => r.category === 'Laboratory Report' || r.category === 'Diagnostic Report'
  ).length

  const latestVital = vitals.length > 0 ? vitals[0] : undefined

  const activeRemindersCount = reminders.filter(
    (r) => r.status !== 'Taken'
  ).length

  // Calculate completeness percentage (records: 40%, vitals: 30%, reminders: 30%)
  const hasRecords = records.length > 0
  const hasVitals = vitals.length > 0
  const hasReminders = reminders.length > 0
  const completenessPercent =
    (hasRecords ? 40 : 0) + (hasVitals ? 30 : 0) + (hasReminders ? 30 : 0)

  // Latest record info
  const latestRecord = records[0]

  return (
    <div className="space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* Top Banner (disclaimer if active) */}
      <DemoDisclaimerBanner />

      {/* Clean Dashboard Heading & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Health, All in One Place
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Understand your clinical records, track daily vitals, manage medication regimens, and consult your health copilot.
          </p>
        </div>

        {/* Quick Header CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('copilot')}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-teal-600" />
            Ask Copilot
          </button>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Record
          </button>
        </div>
      </div>

      {/* 4 Responsive Statistic Cards in One Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Medical Records */}
        <MetricCard
          title="Medical Records"
          value={records.length}
          subtitle={
            records.length === 0
              ? 'No documents stored'
              : records.length === 1
              ? '1 clinical document'
              : `${records.length} clinical documents`
          }
          icon={FileText}
          iconColor="text-teal-700"
          iconBg="bg-teal-50"
          onClick={() => onNavigate('records')}
        />

        {/* Card 2: Recent Reports */}
        <MetricCard
          title="Recent Reports"
          value={labReportsCount}
          subtitle={
            labReportsCount === 0
              ? 'No diagnostic reports'
              : labReportsCount === 1
              ? '1 diagnostic panel'
              : `${labReportsCount} diagnostic panels`
          }
          icon={FileCheck}
          iconColor="text-sky-700"
          iconBg="bg-sky-50"
          onClick={() => onNavigate('summary')}
        />

        {/* Card 3: Vitals Overview */}
        <MetricCard
          title="Vitals Overview"
          value={
            latestVital
              ? `${latestVital.systolic}/${latestVital.diastolic} BP`
              : `${vitals.length} Logs`
          }
          subtitle={
            latestVital
              ? `Pulse: ${latestVital.pulse} bpm • SpO2: ${latestVital.oxygenSaturation}%`
              : 'Log blood pressure & pulse'
          }
          icon={HeartPulse}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          onClick={() => onNavigate('vitals')}
        />

        {/* Card 4: Active Reminders */}
        <MetricCard
          title="Active Reminders"
          value={
            activeRemindersCount > 0
              ? `${activeRemindersCount} Pending`
              : `${reminders.length} Scheduled`
          }
          subtitle={
            reminders.length === 0
              ? 'No active prescriptions'
              : reminders.length === 1
              ? '1 medication regimen'
              : `${reminders.length} medication regimens`
          }
          icon={Pill}
          iconColor="text-indigo-700"
          iconBg="bg-indigo-50"
          onClick={() => onNavigate('reminders')}
        />
      </div>

      {/* Concept Architecture Section */}
      <DigitalTwinExplainer
        onExploreRecords={() => onNavigate('records')}
        onAskCopilot={() => onNavigate('copilot')}
      />

      {/* Health at a Glance Section */}
      <HealthGlanceCard
        latestReportName={latestRecord?.name}
        latestReportDate={latestRecord?.recordDate}
        latestReportCategory={latestRecord?.category}
        latestVitals={latestVital}
        totalRecordsCount={records.length}
        activeRemindersCount={activeRemindersCount}
        completenessPercent={completenessPercent}
        onViewSummary={() => onNavigate('summary')}
        onOpenUpload={onOpenUpload}
        onNavigateVitals={() => onNavigate('vitals')}
      />

      {/* Organized Section: Recent Records & Upcoming Reminders (2-Column Responsive Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRecordsSection
          records={records}
          onViewAllRecords={() => onNavigate('records')}
          onOpenUpload={onOpenUpload}
          onSelectRecord={onSelectRecord}
        />

        <UpcomingRemindersSection
          reminders={reminders}
          onViewAllReminders={() => onNavigate('reminders')}
          onAddReminder={() => onNavigate('reminders')}
        />
      </div>

      {/* Organized Section: Recent Health Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityList
            events={timelineEvents}
            onViewAllTimeline={() => onNavigate('timeline')}
            onSelectEvent={onSelectEvent}
          />
        </div>

        <div className="lg:col-span-1">
          <QuickActions
            onUploadReport={onOpenUpload}
            onViewTimeline={() => onNavigate('timeline')}
            onAskCopilot={() => onNavigate('copilot')}
            onLogVitals={() => onNavigate('vitals')}
            onViewEmergency={() => onNavigate('emergency')}
          />
        </div>
      </div>
    </div>
  )
}
