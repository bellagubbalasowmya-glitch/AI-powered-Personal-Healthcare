import React from 'react'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { Modal } from '../common/Modal'
import type { TimelineEvent } from '../../types/health'

interface TimelineEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: TimelineEvent | null
  onNavigateToRecord?: (recordId: string) => void
}

export const TimelineEventDetailModal: React.FC<TimelineEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onNavigateToRecord,
}) => {
  if (!event) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      subtitle={`Event Date: ${event.date}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-400 font-mono">
            {event.eventType}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {event.relatedRecordId && onNavigateToRecord && (
              <button
                onClick={() => {
                  onNavigateToRecord(event.relatedRecordId!)
                  onClose()
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>View Full Record</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Source & Type details */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Document Type</span>
            <span className="font-semibold text-slate-900">{event.eventType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Reporting Facility / Source</span>
            <span className="font-semibold text-slate-900">{event.source}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Documented Date</span>
            <span className="font-mono text-slate-900">{event.date}</span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Event Summary
          </h4>
          <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
            {event.description}
          </p>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Indexed Clinical Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 font-medium text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-slate-100 text-slate-500 text-[11px] leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            This synthetic event is linked to your demo Health Digital Twin timeline for educational visualization. It does not imply a complete medical record.
          </p>
        </div>
      </div>
    </Modal>
  )
}
