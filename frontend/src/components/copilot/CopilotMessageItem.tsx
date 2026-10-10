import React from 'react'
import { Bot, User, Quote, CornerDownRight } from 'lucide-react'
import type { ChatMessage } from '../../types/health'

interface CopilotMessageItemProps {
  message: ChatMessage
  onSelectFollowUp?: (prompt: string) => void
}

export const CopilotMessageItem: React.FC<CopilotMessageItemProps> = ({
  message,
  onSelectFollowUp,
}) => {
  const isAssistant = message.sender === 'assistant'

  // Formatter for markdown-like bold/lists/headers in synthetic responses
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-slate-900 pt-1">
                {line.replace('### ', '')}
              </h4>
            )
          }
          if (line.startsWith('* ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
              </div>
            )
          }
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+)\.\s(.*)/)
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-bold text-teal-800 text-[11px] shrink-0">
                  {match?.[1]}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(match?.[2] || '') }} />
              </div>
            )
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />
          }
          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatInline(line) }}
            />
          )
        })}
      </div>
    )
  }

  const formatInline = (text: string) => {
    // Basic bold and italic parsing for synthetic messages
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-500 italic">$1</em>')
  }

  return (
    <div
      className={`flex items-start gap-3 ${
        isAssistant ? '' : 'flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isAssistant
            ? 'bg-teal-600 text-white shadow-xs'
            : 'bg-slate-800 text-white shadow-xs'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-2xl rounded-2xl p-4 space-y-2.5 ${
          isAssistant
            ? 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
            : 'bg-teal-600 text-white'
        }`}
      >
        {/* Header line for Assistant */}
        {isAssistant && (
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900">HealthTwin Copilot</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                SIMULATED AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {message.timestamp}
            </span>
          </div>
        )}

        {/* Content */}
        <div className={isAssistant ? 'text-slate-800' : 'text-white text-xs leading-relaxed'}>
          {isAssistant ? (
            renderFormattedContent(message.content)
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Citations block for grounded assistant messages */}
        {isAssistant && message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
              <Quote className="w-3 h-3 text-teal-600" />
              Document Grounding (Simulated Citations)
            </span>
            <div className="space-y-0.5">
              {message.citations.map((c, i) => (
                <div
                  key={i}
                  className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested follow up chips */}
        {isAssistant &&
          message.suggestedFollowUps &&
          message.suggestedFollowUps.length > 0 &&
          onSelectFollowUp && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-medium block">
                Suggested exploration:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.suggestedFollowUps.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectFollowUp(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors flex items-center gap-1 border border-slate-200/60"
                  >
                    <CornerDownRight className="w-3 h-3 text-slate-400" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
