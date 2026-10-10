import React, { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import type { TimelineEvent } from '../types/health'
import { TimelineFilter } from '../components/timeline/TimelineFilter'
import { TimelineItem } from '../components/timeline/TimelineItem'
import { TimelineEventDetailModal } from '../components/timeline/TimelineEventDetailModal'
import { EmptyState } from '../components/common/EmptyState'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

interface HealthTimelinePageProps {
  events: TimelineEvent[]
  onNavigateToRecord?: (recordId: string) => void
}

export const HealthTimeline: React.FC<HealthTimelinePageProps> = ({
  events,
  onNavigateToRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  const filteredEvents = useMemo(() => {
    let result = [...events]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (selectedType !== 'All') {
      result = result.filter((e) => e.eventType === selectedType)
    }

    // Sort newest to oldest
    result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return result
  }, [events, searchQuery, selectedType])

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />

      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Health Timeline
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            CHRONOLOGICAL TWIN
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Track how medical reports, consultations, and wearable milestones map into your health journey.
        </p>
      </div>

      {/* Legend Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          Event Legend:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
          <span>Laboratory Report</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
          <span>Prescription</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
          <span>Hospital Visit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
          <span>Diagnostic / Imaging</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>Wellness Entry</span>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <TimelineFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredEvents.length}
      />

      {/* Timeline or List Rendering */}
      {filteredEvents.length > 0 ? (
        viewMode === 'timeline' ? (
          <div className="relative pt-2 pl-2">
            {filteredEvents.map((evt, index) => (
              <TimelineItem
                key={evt.id}
                event={evt}
                isLast={index === filteredEvents.length - 1}
                onSelect={(e) => setSelectedEvent(e)}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {evt.date}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {evt.eventType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{evt.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {evt.source}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title={events.length === 0 ? "No Timeline Events" : "No Matching Timeline Events"}
          description={events.length === 0 ? "Timeline events will appear here as medical reports, clinical visits, and health measurements are logged." : "Adjust your search query or clear the event type filter to see other historical entries."}
          actionLabel={events.length === 0 ? undefined : "Reset Filters"}
          onAction={events.length === 0 ? undefined : () => {
            setSearchQuery('')
            setSelectedType('All')
          }}
        />
      )}

      {/* Detail Modal */}
      <TimelineEventDetailModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onNavigateToRecord={onNavigateToRecord}
      />
    </div>
  )
}
