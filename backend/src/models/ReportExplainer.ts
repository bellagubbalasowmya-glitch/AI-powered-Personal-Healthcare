import type { IExtractedLabItem } from './MedicalRecord.js'

export interface IReportExplainer {
  id: string
  userId: string
  fileName: string
  fileSize: string
  uploadDate: string
  category: string
  extractionStatus: 'Complete (Demo)' | 'Needs Correction' | 'Parsing (Simulated)'
  analytes: IExtractedLabItem[]
  plainEnglishSummary: string
  teluguSummary: string
  terminology: { term: string; english: string; telugu: string }[]
  isDemoSimulation: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}
