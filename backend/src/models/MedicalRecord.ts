export interface IExtractedLabItem {
  id: string
  testName: string
  value: string | number
  unit: string
  referenceRange: string
  status: 'Within Reference Range' | 'Outside Reference Range' | 'Needs Review' | 'Not Available'
  category: 'Metabolic' | 'Lipid' | 'Hematology' | 'Renal' | 'Electrolytes' | 'Endocrine' | 'General'
  interpretationNotes?: string
  teluguExplanation?: string
}

export interface IMedicationItem {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribingClinician: string
  instructions: string
  status: 'Active' | 'Completed' | 'As Needed'
}

export interface IMedicalRecord {
  id: string
  userId: string
  name: string
  category: string
  recordDate: string
  facility: string
  clinician: string
  fileSize: string
  fileType: string
  processingStatus: string
  summary: string
  isSynthetic: boolean
  extractedFields: IExtractedLabItem[]
  medications?: IMedicationItem[]
  keyFindings?: string[]
  clinicianDiscussionQuestions?: string[]
  terminologyGlossary?: { term: string; definition: string; teluguDefinition?: string }[]
  createdAt?: string | Date
  updatedAt?: string | Date
}
