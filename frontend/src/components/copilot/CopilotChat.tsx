import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  ShieldCheck,
} from 'lucide-react'
import type { ChatMessage } from '../../types/health'
import { CopilotMessageItem } from './CopilotMessageItem'
import { api } from '../../services/api'

const HEALTH_EXAMPLE_PROMPTS = [
  'Explain common blood pressure categories.',
  'How do I prepare for a fasting blood test?',
  'What questions should I ask my doctor about my lab results?',
  'What is the difference between HDL and LDL cholesterol?',
]

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  timestamp: 'Just now',
  content:
    'Hello! I am your **HealthTwin AI Health Copilot**. I can help you understand your medical records, explain laboratory results in plain language, and prepare thoughtful questions for your healthcare provider.\n\n*Please note: I provide educational health information and not clinical medical diagnoses.* How can I assist you today?',
  isSimulated: false,
  suggestedFollowUps: [
    'Explain common blood pressure categories.',
    'What questions should I ask my doctor about my lab results?',
  ],
}

export const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE])
  const [inputPrompt, setInputPrompt] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim()
    if (!prompt || isThinking) return

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      content: prompt,
      isSimulated: false,
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputPrompt('')
    setIsThinking(true)

    try {
      // Query the live Express backend API
      const result = await api.askCopilot(prompt)

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        content: result.answer,
        isSimulated: false,
        citations: result.citations && result.citations.length > 0 ? result.citations : undefined,
        suggestedFollowUps: result.suggestedFollowUps || HEALTH_EXAMPLE_PROMPTS.slice(0, 3),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        content:
          'I am currently unable to reach the copilot service. Please verify your connection or try again shortly. For urgent medical symptoms, please reach out to your local healthcare provider or emergency services immediately.',
        isSimulated: false,
        suggestedFollowUps: HEALTH_EXAMPLE_PROMPTS.slice(0, 2),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearConversation = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE])
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[calc(100vh-12rem)] min-h-[560px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 border-b border-slate-200/90 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                HealthTwin AI Copilot
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personalized health information assistant
            </p>
          </div>
        </div>

        <button
          onClick={handleClearConversation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <CopilotMessageItem
            key={msg.id}
            message={msg}
            onSelectFollowUp={(q) => handleSendMessage(q)}
          />
        ))}

        {isThinking && (
          <div className="flex items-start gap-3 text-xs text-slate-500 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              Thinking and reviewing clinical references...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Example Topics:
        </span>
        {HEALTH_EXAMPLE_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isThinking}
            className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-700 whitespace-nowrap transition-colors shadow-2xs shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <div className="p-4 bg-white border-t border-slate-200/90">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about lab tests, wellness, or health topics..."
            disabled={isThinking}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:bg-slate-50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors shadow-xs shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            AI answers provide educational information only. Not clinical medical advice.
          </span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  )
}
