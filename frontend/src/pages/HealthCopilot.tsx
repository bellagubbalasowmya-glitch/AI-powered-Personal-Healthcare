import React from 'react'
import { CopilotChat } from '../components/copilot/CopilotChat'
import { DemoDisclaimerBanner } from '../components/layout/DemoDisclaimerBanner'

export const HealthCopilot: React.FC = () => {
  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-200">
      <DemoDisclaimerBanner />
      <CopilotChat />
    </div>
  )
}
