import React, { useState } from 'react'
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
import type { SleepDataPoint } from '../../types/health'
import { Moon } from 'lucide-react'

interface SleepChartProps {
  data: SleepDataPoint[]
}

export const SleepChart: React.FC<SleepChartProps> = ({ data }) => {
  const [daysCount, setDaysCount] = useState<number>(7)
  const filteredData = data.slice(-daysCount)
  const avgSleep = (
    filteredData.reduce((acc, curr) => acc + curr.totalHours, 0) /
    filteredData.length
  ).toFixed(1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Moon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Sleep Duration &amp; Stages
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Avg: <span className="font-bold text-slate-800">{avgSleep} hrs</span>/night (Recommended 7-9 hrs)
          </p>
        </div>

        {/* Days Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setDaysCount(days)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                daysCount === days
                  ? 'bg-white text-indigo-800 shadow-2xs font-semibold'
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
              domain={[0, 10]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit="h"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SleepDataPoint
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1 min-w-[140px]">
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.date}
                      </span>
                      <div className="font-bold text-indigo-300">
                        Total: {item.totalHours} hrs ({item.efficiency}% eff.)
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-0.5 pt-1">
                        <div>Deep Sleep: {item.deepHours}h</div>
                        <div>REM Sleep: {item.remHours}h</div>
                        <div>Light Sleep: {item.lightHours}h</div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine
              y={7.0}
              stroke="#6366f1"
              strokeDasharray="4 4"
              label={{
                value: '7.0h Min Target',
                position: 'insideTopRight',
                fill: '#6366f1',
                fontSize: 10,
              }}
            />
            <Bar dataKey="deepHours" stackId="a" fill="#312e81" name="Deep" />
            <Bar dataKey="remHours" stackId="a" fill="#6366f1" name="REM" />
            <Bar
              dataKey="lightHours"
              stackId="a"
              fill="#c7d2fe"
              name="Light"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#312e81]" />
          <span>Deep Sleep</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#6366f1]" />
          <span>REM Sleep</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#c7d2fe]" />
          <span>Light Sleep</span>
        </div>
      </div>
    </div>
  )
}
