export type RecordCategory =
  | 'Laboratory Report'
  | 'Prescription'
  | 'Hospital Visit'
  | 'Discharge Summary'
  | 'Diagnostic Report'
  | 'Wellness Entry'

export type RangeStatus =
  | 'Within Reference Range'
  | 'Outside Reference Range'
  | 'Needs Review'
  | 'Not Available'

export interface ExtractedLabItem {
  id: string
  testName: string
  value: string | number
  unit: string
  referenceRange: string
  status: RangeStatus
  category: 'Metabolic' | 'Lipid' | 'Hematology' | 'Renal' | 'Electrolytes' | 'Endocrine' | 'General'
  interpretationNotes?: string
  teluguExplanation?: string
}

export interface MedicationItem {
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

export interface MedicalRecord {
  id: string
  name: string
  category: RecordCategory
  recordDate: string
  facility: string
  clinician: string
  fileSize: string
  fileType: 'PDF' | 'PNG' | 'JPG' | 'JPEG'
  processingStatus: 'Processed (Demo)' | 'Needs Review' | 'Uploaded (Pending Backend)'
  summary: string
  teluguSummary?: string
  isSynthetic?: boolean
  extractedFields: ExtractedLabItem[]
  medications?: MedicationItem[]
  keyFindings?: string[]
  clinicianDiscussionQuestions?: string[]
  terminologyGlossary?: { term: string; definition: string; teluguDefinition?: string }[]
}


export interface TimelineEvent {
  id: string
  title: string
  eventType: RecordCategory
  date: string
  source: string
  description: string
  relatedRecordId?: string
  tags?: string[]
  severity?: 'normal' | 'caution' | 'neutral'
}

export interface HeartRatePoint {
  time: string
  bpm: number
  restingBpm: number
}

export interface DailyStepPoint {
  date: string
  steps: number
  goal: number
  distanceKm: number
}

export interface SleepDataPoint {
  date: string
  deepHours: number
  remHours: number
  lightHours: number
  totalHours: number
  efficiency: number
}

export interface ActivityPoint {
  date: string
  activeMinutes: number
  targetMinutes: number
  caloriesBurned: number
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  content: string
  isSimulated: boolean
  citations?: string[]
  suggestedFollowUps?: string[]
}

export interface DemoUserProfile {
  name: string
  patientId: string
  age: number
  gender: string
  bloodType: string
  allergies: string
  chronicConditions: string[]
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
}

export type SupportedLanguage = 'en' | 'te'

// ==========================================
// NEW MODULE TYPES
// ==========================================

// 1. Smart Medicine Reminder
export type MedicationScheduleTime = 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime'
export type ReminderStatus = 'Pending' | 'Taken' | 'Missed'

export interface MedicineReminder {
  id: string
  medicineName: string
  prescribedDosage: string
  scheduleTime: MedicationScheduleTime
  timeString: string // e.g. "08:00 AM"
  frequency: string // e.g. "Daily", "Twice Daily", "With Meals"
  startDate: string
  endDate?: string
  instructions: string
  status: ReminderStatus
  lastTakenTimestamp?: string
  notes?: string
}

// 2. Health Vitals Monitoring
export interface VitalMeasurement {
  id: string
  date: string
  time: string
  systolic: number // mmHg
  diastolic: number // mmHg
  pulse: number // bpm
  temperature: number // °F
  temperatureUnit: '°F' | '°C'
  oxygenSaturation: number // %
  notes?: string
  cautiousAlert?: string
  isCautious: boolean
}

// 3. AI Medical Report Explainer Upload
export interface ReportExplainerDocument {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
  category: string
  extractionStatus: 'Complete (Demo)' | 'Needs Correction' | 'Parsing (Simulated)'
  analytes: ExtractedLabItem[]
  plainEnglishSummary: string
  teluguSummary: string
  terminology: { term: string; english: string; telugu: string }[]
  isDemoSimulation: true
}

// 4. Doctor Appointment Manager
export type AppointmentStatus =
  | 'Confirmed (Local Demo)'
  | 'Rescheduled'
  | 'Completed'
  | 'Cancelled'

export interface DoctorAppointment {
  id: string
  doctorName: string
  specialty: string
  date: string
  time: string
  durationMinutes: number
  clinicHospital: string
  location: string
  visitType: 'In-Person' | 'Telehealth Video' | 'Follow-Up'
  reason: string
  preparationNotes: string
  status: AppointmentStatus
  isLocalDemo: true
}

// 5. Emergency Health Card
export interface EmergencyCardInfo {
  patientName: string
  patientId: string
  age: number
  gender: string
  bloodGroup: string
  allergies: string[]
  chronicConditions: string[]
  criticalMedications: string[]
  emergencyContacts: {
    id: string
    name: string
    relationship: string
    phone: string
    isPrimary: boolean
  }[]
  primaryPhysician: {
    name: string
    clinic: string
    phone: string
  }
  preferredHospital: string
  organDonor: boolean
  medicalNotes: string
  lastUpdated: string
}

// 6. Personalized Wellness Tracker
export interface HabitItem {
  id: string
  name: string
  category: 'mindfulness' | 'hydration' | 'activity' | 'nutrition' | 'sleep'
  completed: boolean
}

export interface DailyWellnessEntry {
  id: string
  date: string
  sleepHours: number
  sleepQuality: 'Restful' | 'Moderate' | 'Restless'
  waterGlasses: number // e.g. 8 glasses (250ml each)
  waterTarget: number // e.g. 8 glasses
  activeMinutes: number
  habits: HabitItem[]
  moodNote?: string
}

// 7. AI Unknown-Condition Alert
export type UncertaintyStatus =
  | 'Needs review'
  | 'Incomplete information'
  | 'Unable to interpret reliably'

export interface UnknownConditionAlertItem {
  id: string
  sourceDocument: string
  testOrFinding: string
  detectionDate: string
  status: UncertaintyStatus
  confidenceLabel: 'Low Confidence' | 'Ambiguous Data' | 'Missing Baseline'
  uncertaintyReason: string
  missingParameters: string[]
  clinicianDiscussionRecommendation: string
  hasBeenReviewed: boolean
}
