import React, { useState } from 'react'
import {
  Heart,
  Footprints,
  Moon,
  Zap,
  ShieldAlert,
  Smartphone,
} from 'lucide-react'
import {
  MOCK_INTRADAY_HEART_RATE,
  MOCK_STEPS_30_DAYS,
  MOCK_SLEEP_30_DAYS,
  MOCK_ACTIVITY_30_DAYS,
  WELLNESS_SUMMARY_METRICS,
  SIMULATED_WEARABLE_NOTE,
} from '../data/mockWellness'
import { WellnessMetricCard } from '../components/wellness/WellnessMetricCard'
import { HeartRateChart } from '../components/wellness/HeartRateChart'
import { StepCountChart } from '../components/wellness/StepCountChart'
import { SleepChart } from '../components/wellness/SleepChart'
import { ActivityChart } from '../components/wellness/ActivityChart'
import { WellnessTrendsSummary } from '../components/wellness/WellnessTrendsSummary'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

export const Wellness: React.FC = () => {
  const [stepDays, setStepDays] = useState<number>(14)

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Page Heading & Simulated Device Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Wellness &amp; Wearables
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              TELEMETRY STREAM
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Simulated physiological trends illustrating wearable data integration with your digital twin.
          </p>
        </div>

        {/* Device Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs self-start sm:self-auto">
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">Virtual Smartwatch:</span>
          <span className="font-bold text-teal-700">Simulated Stream</span>
        </div>
      </div>

      {/* Mandatory Simulated Data Disclaimer Bar */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Notice:</strong> &ldquo;{SIMULATED_WEARABLE_NOTE}&rdquo; HealthTwin AI does not monitor live hardware in this hackathon demo, does not diagnose medical conditions, and does not recommend medication modifications.
        </p>
      </div>

      {/* 4 Summary Cards */}
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
          colorClass="text-emerald-700"
          bgClass="bg-emerald-50"
        />
      </div>

      {/* Recharts Visualizations Grid */}
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

      {/* Educational Trend Synthesis Panel */}
      <WellnessTrendsSummary />
    </div>
  )
}
