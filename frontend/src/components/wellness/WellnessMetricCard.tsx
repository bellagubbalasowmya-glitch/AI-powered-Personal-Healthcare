import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface WellnessMetricProps {
  title: string
  value: string | number
  unit: string
  statusNote: string
  trendChange: string
  icon: LucideIcon
  colorClass: string
  bgClass: string
}

export const WellnessMetricCard: React.FC<WellnessMetricProps> = ({
  title,
  value,
  unit,
  statusNote,
  trendChange,
  icon: Icon,
  colorClass,
  bgClass,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {value}
          </span>
          <span className="text-xs text-slate-500 font-medium">{unit}</span>
        </div>
        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{statusNote}</p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-emerald-700 font-medium">{trendChange}</span>
        <span className="text-slate-400 font-medium text-[10px]">Tracked</span>
      </div>
    </div>
  )
}
