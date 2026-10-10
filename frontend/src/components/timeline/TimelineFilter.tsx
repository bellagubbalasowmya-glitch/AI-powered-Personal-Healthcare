import React from 'react'
import {
  Search,
  LayoutList,
  GitCommit,
  FileText,
  Pill,
  Hospital,
  Activity,
  Layers,
} from 'lucide-react'


interface TimelineFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedType: string
  onTypeChange: (type: string) => void
  viewMode: 'timeline' | 'list'
  onViewModeChange: (mode: 'timeline' | 'list') => void
  totalCount: number
}

export const TimelineFilter: React.FC<TimelineFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  const eventTypes: { type: string; label: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'All', label: 'All Events', icon: Layers },
    { type: 'Laboratory Report', label: 'Lab Reports', icon: FileText },
    { type: 'Prescription', label: 'Prescriptions', icon: Pill },
    { type: 'Hospital Visit', label: 'Clinical Visits', icon: Hospital },
    { type: 'Diagnostic Report', label: 'Diagnostics', icon: FileText },
    { type: 'Wellness Entry', label: 'Wellness Telemetry', icon: Activity },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search timeline events, providers, or medications..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => onViewModeChange('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            {totalCount} event{totalCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {eventTypes.map((item) => {
          const Icon = item.icon
          const isSelected = selectedType === item.type
          return (
            <button
              key={item.type}
              onClick={() => onTypeChange(item.type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
