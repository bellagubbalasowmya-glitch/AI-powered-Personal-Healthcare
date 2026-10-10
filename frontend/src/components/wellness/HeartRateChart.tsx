import React from 'react'
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
import type { HeartRatePoint } from '../../types/health'
import { Heart } from 'lucide-react'

interface HeartRateChartProps {
  data: HeartRatePoint[]
}

export const HeartRateChart: React.FC<HeartRateChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Heart Rate Intraday Curve
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            24-hour continuous beats per minute (bpm) pattern
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 self-start sm:self-auto font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
            <span>Measured BPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-400 border-b border-dashed inline-block" />
            <span>Resting Baseline (60 bpm)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              domain={[40, 160]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit=" bpm"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                      <span className="font-mono text-[11px] text-slate-400">
                        Time: {payload[0].payload.time}
                      </span>
                      <div className="font-bold text-rose-300">
                        {payload[0].value} bpm
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Simulated Reading
                      </span>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine
              y={60}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: 'Baseline 60 bpm',
                position: 'insideBottomRight',
                fill: '#94a3b8',
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f43f5e' }}
              activeDot={{ r: 6, fill: '#be123c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Lowest: 52 bpm (04:00 AM during slow-wave sleep)</span>
        <span>Peak: 142 bpm (18:15 PM workout)</span>
      </div>
    </div>
  )
}
