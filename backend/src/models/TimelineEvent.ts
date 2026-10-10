export interface ITimelineEvent {
  id: string
  userId: string
  title: string
  eventType: string
  date: string
  source: string
  description: string
  relatedRecordId?: string
  tags?: string[]
  severity?: 'normal' | 'caution' | 'neutral'
  createdAt?: string | Date
  updatedAt?: string | Date
}
