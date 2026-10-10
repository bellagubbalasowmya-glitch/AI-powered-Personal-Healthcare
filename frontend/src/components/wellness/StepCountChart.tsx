import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import type { DailyStepPoint } from '../../types/health'
import { Footprints } from 'lucide-react'

interface StepCountChartProps {
  data: DailyStepPoint[]
  daysCount: number
  onDaysChange: (days: number) => void
}

export const StepCountChart: React.FC<StepCountChartProps> = ({
  data,
  daysCount,
  onDaysChange,
}) => {
  const filteredData = data.slice(-daysCount)
  const averageSteps = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.steps, 0) / filteredData.length
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Footprints className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Daily Step Count</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Avg: <span className="font-bold text-slate-800">{averageSteps.toLocaleString()}</span> steps/day (Target: 8,000)
          </p>
        </div>

        {/* Days Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => onDaysChange(days)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                daysCount === days
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DailyStepPoint
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.date}
                      </span>
                      <div className="font-bold text-teal-300">
                        {item.steps.toLocaleString()} steps
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Est. Distance: {item.distanceKm} km
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Simulated Telemetry
                      </span>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine
              y={8000}
              stroke="#0d9488"
              strokeDasharray="4 4"
              label={{
                value: 'Goal 8,000',
                position: 'insideTopRight',
                fill: '#0d9488',
                fontSize: 10,
              }}
            />
            <Bar
              dataKey="steps"
              fill="#0d9488"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Goal adherence: {Math.round((filteredData.filter((d) => d.steps >= 8000).length / filteredData.length) * 100)}% of monitored days</span>
        <span>Peak day: {Math.max(...filteredData.map((d) => d.steps)).toLocaleString()} steps</span>
      </div>
    </div>
  )
}
