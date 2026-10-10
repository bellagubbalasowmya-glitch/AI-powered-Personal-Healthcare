export interface IUnknownConditionAlert {
  id: string
  userId: string
  sourceDocument: string
  testOrFinding: string
  detectionDate: string
  status: 'Needs review' | 'Incomplete information' | 'Unable to interpret reliably'
  confidenceLabel: 'Low Confidence' | 'Ambiguous Data' | 'Missing Baseline'
  uncertaintyReason: string
  missingParameters: string[]
  clinicianDiscussionRecommendation: string
  hasBeenReviewed: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}
