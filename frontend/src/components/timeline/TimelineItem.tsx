import React from 'react'
import {
  FileText,
  Pill,
  Hospital,
  Activity,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import type { TimelineEvent } from '../../types/health'

interface TimelineItemProps {
  event: TimelineEvent
  isLast: boolean
  onSelect: (event: TimelineEvent) => void
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  event,
  isLast,
  onSelect,
}) => {
  const getEventMeta = (type: string) => {
    switch (type) {
      case 'Laboratory Report':
        return {
          icon: FileText,
          color: 'text-teal-700',
          bg: 'bg-teal-50',
          border: 'border-teal-200',
        }
      case 'Prescription':
        return {
          icon: Pill,
          color: 'text-indigo-700',
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
        }
      case 'Hospital Visit':
        return {
          icon: Hospital,
          color: 'text-rose-700',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
        }
      case 'Wellness Entry':
        return {
          icon: Activity,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        }
      case 'Diagnostic Report':
      default:
        return {
          icon: Calendar,
          color: 'text-sky-700',
          bg: 'bg-sky-50',
          border: 'border-sky-200',
        }
    }
  }

  const meta = getEventMeta(event.eventType)
  const Icon = meta.icon

  return (
    <div className="relative flex items-start gap-4 group">
      {/* Vertical Spine Line */}
      {!isLast && (
        <span
          className="absolute left-5 top-11 bottom-0 w-0.5 bg-slate-200 group-hover:bg-teal-300 transition-colors"
          aria-hidden="true"
        />
      )}

      {/* Node Icon Circle */}
      <div
        className={`relative z-10 w-10 h-10 rounded-xl ${meta.bg} ${meta.color} border ${meta.border} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Event Content Card */}
      <div
        onClick={() => onSelect(event)}
        className="flex-1 pb-6 cursor-pointer"
      >
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-teal-400 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {event.eventType}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {event.source}
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 self-start sm:self-auto">
              {event.date}
            </span>
          </div>

          <div className="mt-2.5 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                {event.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                {event.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-50">
              {event.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
