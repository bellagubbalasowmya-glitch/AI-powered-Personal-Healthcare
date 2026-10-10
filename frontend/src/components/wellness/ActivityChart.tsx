import React, { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import type { ActivityPoint } from '../../types/health'
import { Zap } from 'lucide-react'

interface ActivityChartProps {
  data: ActivityPoint[]
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const [daysCount, setDaysCount] = useState<number>(7)
  const filteredData = data.slice(-daysCount)
  const avgMins = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.activeMinutes, 0) /
      filteredData.length
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Daily Active Minutes
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Avg: <span className="font-bold text-slate-800">{avgMins} mins</span>/day (WHO standard: &ge; 30 mins)
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
                  ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
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
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              unit="m"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ActivityPoint
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.date}
                      </span>
                      <div className="font-bold text-emerald-300">
                        {item.activeMinutes} Active Minutes
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Est. Burn: {item.caloriesBurned} kcal
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Simulated Metric
                      </span>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine
              y={30}
              stroke="#059669"
              strokeDasharray="4 4"
              label={{
                value: '30m Daily Goal',
                position: 'insideTopRight',
                fill: '#059669',
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="activeMinutes"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#activeGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Active days: {filteredData.filter((d) => d.activeMinutes >= 30).length} of {filteredData.length}</span>
        <span>Peak activity: {Math.max(...filteredData.map((d) => d.activeMinutes))} mins</span>
      </div>
    </div>
  )
}
