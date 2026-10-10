import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  badgeText?: string
  onClick?: () => void
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-teal-700',
  iconBg = 'bg-teal-50',
  badgeText,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={`group relative bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-teal-500/40 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              {title}
            </span>
            {badgeText && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                {badgeText}
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-teal-900 transition-colors truncate">
            {value}
          </div>

          {subtitle && (
            <p className="text-xs text-slate-500 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end justify-between gap-2 shrink-0">
          <div
            className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {onClick && (
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition-colors" />
          )}
        </div>
      </div>
    </div>
  )
}
