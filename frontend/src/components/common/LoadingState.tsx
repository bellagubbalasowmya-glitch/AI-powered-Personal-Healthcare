import React from 'react'

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading synthetic records...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
      <div className="w-8 h-8 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <span className="text-xs text-slate-400 mt-1">DEMO STATE — SYNTHETIC SIMULATION</span>
    </div>
  )
}
