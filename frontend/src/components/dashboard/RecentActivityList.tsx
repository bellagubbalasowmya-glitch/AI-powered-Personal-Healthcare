import React from 'react'
import { FileText, Pill, Activity, Calendar, ArrowRight, Clock } from 'lucide-react'
import type { TimelineEvent } from '../../types/health'

interface RecentActivityListProps {
  events: TimelineEvent[]
  onViewAllTimeline: () => void
  onSelectEvent: (event: TimelineEvent) => void
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  events,
  onViewAllTimeline,
  onSelectEvent,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Laboratory Report':
      case 'Diagnostic Report':
        return <FileText className="w-4 h-4 text-teal-700" />
      case 'Prescription':
        return <Pill className="w-4 h-4 text-indigo-700" />
      case 'Wellness Entry':
        return <Activity className="w-4 h-4 text-emerald-700" />
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />
    }
  }

  const getEventBg = (type: string) => {
    switch (type) {
      case 'Laboratory Report':
      case 'Diagnostic Report':
        return 'bg-teal-50'
      case 'Prescription':
        return 'bg-indigo-50'
      case 'Wellness Entry':
        return 'bg-emerald-50'
      default:
        return 'bg-slate-100'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Health Activity
            </h3>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
              {events.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological log of medical documents, clinical notes, and events
          </p>
        </div>
        <button
          onClick={onViewAllTimeline}
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 transition-colors shrink-0"
        >
          Full Timeline <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {events.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {events.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 -mx-2 px-2.5 rounded-xl transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl ${getEventBg(
                    evt.eventType
                  )} group-hover:scale-105 transition-all shrink-0 mt-0.5 shadow-2xs`}
                >
                  {getEventIcon(evt.eventType)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-800 transition-colors truncate">
                      {evt.title}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {evt.eventType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {evt.description}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    Source: {evt.source}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-medium text-slate-600 font-mono">
                  {evt.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No activity logged yet</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Uploaded records, vitals changes, and scheduled appointments will appear in your health timeline.
          </p>
        </div>
      )}
    </div>
  )
}
