import React from 'react'
import { CheckCircle2, AlertTriangle, HelpCircle, AlertCircle } from 'lucide-react'
import type { RangeStatus } from '../../types/health'

interface StatusBadgeProps {
  status: RangeStatus | 'Active' | 'Processed (Demo)' | 'Needs Review' | 'Uploaded (Pending Backend)' | string
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm'
  const paddingClass = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  switch (status) {
    case 'Within Reference Range':
    case 'Active':
    case 'Processed (Demo)':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${paddingClass}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status}</span>
        </span>
      )

    case 'Outside Reference Range':
    case 'caution':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${paddingClass}`}
        >
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status}</span>
        </span>
      )

    case 'Needs Review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 ${paddingClass}`}
        >
          <HelpCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status}</span>
        </span>
      )

    case 'Uploaded (Pending Backend)':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 ${paddingClass}`}
        >
          <AlertCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status}</span>
        </span>
      )

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${paddingClass}`}
        >
          <span>{status}</span>
        </span>
      )
  }
}
