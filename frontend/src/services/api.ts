import type {
  MedicalRecord,
  TimelineEvent,
  MedicineReminder,
  VitalMeasurement,
  ReportExplainerDocument,
  DoctorAppointment,
  EmergencyCardInfo,
  DailyWellnessEntry,
  UnknownConditionAlertItem,
} from '../types/health'

export const EMPTY_EMERGENCY_CARD: EmergencyCardInfo = {
  patientName: '',
  patientId: '',
  age: 0,
  gender: '',
  bloodGroup: '',
  allergies: [],
  chronicConditions: [],
  criticalMedications: [],
  emergencyContacts: [],
  primaryPhysician: { name: '', clinic: '', phone: '' },
  preferredHospital: '',
  organDonor: false,
  medicalNotes: '',
  lastUpdated: 'Not yet configured',
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let activeToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('healthtwin_auth_token') : null

export function setActiveAuthToken(token: string | null) {
  activeToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('healthtwin_auth_token', token)
    } else {
      localStorage.removeItem('healthtwin_auth_token')
    }
  }
}

async function getAuthHeader(): Promise<string> {
  if (activeToken) return `Bearer ${activeToken}`
  return ''
}

function getCurrentUserId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem('healthtwin_current_user')
    if (raw) {
      const u = JSON.parse(raw)
      return u?.id || ''
    }
  } catch {}
  return ''
}

// Helper for standard fetch calls with timeout and fallback
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<{ data: T; isLive: boolean; error?: string }> {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const authHeader = await getAuthHeader()
    const currentUserId = getCurrentUserId()
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
        ...(options.headers || {}),
      },
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.error || `HTTP error ${res.status}`)
    }

    const json = await res.json()
    return {
      data: (json.data !== undefined ? json.data : json) as T,
      isLive: true,
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (fallbackData !== undefined) {
      return { data: fallbackData, isLive: false, error: err.message }
    }
    throw err
  }
}

export const api = {
  // System Health
  async checkHealth(): Promise<{ status: string; database?: any; isLive: boolean }> {
    try {
      const res = await apiRequest<{ status: string; database?: any }>('/health', { method: 'GET' })
      return { ...res.data, isLive: res.isLive }
    } catch {
      return { status: 'offline', isLive: false }
    }
  },

  // 1. Medical Records
  async getRecords(): Promise<{ data: MedicalRecord[]; isLive: boolean }> {
    return apiRequest<MedicalRecord[]>('/records', { method: 'GET' }, [])
  },

  async createRecord(record: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const res = await apiRequest<MedicalRecord>('/records', {
      method: 'POST',
      body: JSON.stringify(record),
    })
    return res.data
  },

  async uploadRecord(
    file: File,
    metadata?: { category?: string; facility?: string; clinician?: string; name?: string }
  ): Promise<MedicalRecord> {
    const url = `${API_BASE_URL}/records/upload`
    const formData = new FormData()
    formData.append('file', file)
    if (metadata?.category) formData.append('category', metadata.category)
    if (metadata?.facility) formData.append('facility', metadata.facility)
    if (metadata?.clinician) formData.append('clinician', metadata.clinician)
    if (metadata?.name) formData.append('name', metadata.name)

    const authHeader = await getAuthHeader()
    const currentUserId = getCurrentUserId()

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
      },
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson.error || `Upload failed with status ${res.status}`)
    }

    const json = await res.json()
    return json.data
  },


  async updateRecord(id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const res = await apiRequest<MedicalRecord>(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    })
    return res.data
  },

  async deleteRecord(id: string): Promise<boolean> {
    await apiRequest(`/records/${id}`, { method: 'DELETE' })
    return true
  },

  // 2. Health Summary
  async getHealthSummary(): Promise<any> {
    const res = await apiRequest('/summary', { method: 'GET' }, null)
    return res.data
  },

  // 3. Health Timeline
  async getTimeline(): Promise<{ data: TimelineEvent[]; isLive: boolean }> {
    return apiRequest<TimelineEvent[]>('/timeline', { method: 'GET' }, [])
  },

  // 4. Medicine Reminders
  async getReminders(): Promise<{ data: MedicineReminder[]; isLive: boolean }> {
    return apiRequest<MedicineReminder[]>('/reminders', { method: 'GET' }, [])
  },

  async createReminder(reminder: Partial<MedicineReminder>): Promise<MedicineReminder> {
    const res = await apiRequest<MedicineReminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    })
    return res.data
  },

  async updateReminder(id: string, reminder: Partial<MedicineReminder>): Promise<MedicineReminder> {
    const res = await apiRequest<MedicineReminder>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminder),
    })
    return res.data
  },

  async deleteReminder(id: string): Promise<boolean> {
    await apiRequest(`/reminders/${id}`, { method: 'DELETE' })
    return true
  },

  // 5. Health Vitals
  async getVitals(): Promise<{ data: VitalMeasurement[]; isLive: boolean }> {
    return apiRequest<VitalMeasurement[]>('/vitals', { method: 'GET' }, [])
  },

  async createVital(vital: Partial<VitalMeasurement>): Promise<VitalMeasurement> {
    const res = await apiRequest<VitalMeasurement>('/vitals', {
      method: 'POST',
      body: JSON.stringify(vital),
    })
    return res.data
  },

  async deleteVital(id: string): Promise<boolean> {
    await apiRequest(`/vitals/${id}`, { method: 'DELETE' })
    return true
  },

  // 6. Doctor Appointments
  async getAppointments(): Promise<{ data: DoctorAppointment[]; isLive: boolean }> {
    return apiRequest<DoctorAppointment[]>('/appointments', { method: 'GET' }, [])
  },

  async createAppointment(appointment: Partial<DoctorAppointment>): Promise<DoctorAppointment> {
    const res = await apiRequest<DoctorAppointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    })
    return res.data
  },

  async updateAppointment(id: string, appointment: Partial<DoctorAppointment>): Promise<DoctorAppointment> {
    const res = await apiRequest<DoctorAppointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    })
    return res.data
  },

  async deleteAppointment(id: string): Promise<boolean> {
    await apiRequest(`/appointments/${id}`, { method: 'DELETE' })
    return true
  },

  // 7. Wellness Tracker
  async getWellnessLogs(): Promise<{ data: DailyWellnessEntry[]; isLive: boolean }> {
    return apiRequest<DailyWellnessEntry[]>('/wellness', { method: 'GET' }, [])
  },

  async createWellnessLog(entry: Partial<DailyWellnessEntry>): Promise<DailyWellnessEntry> {
    const res = await apiRequest<DailyWellnessEntry>('/wellness', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    return res.data
  },

  async updateWellnessLog(id: string, entry: Partial<DailyWellnessEntry>): Promise<DailyWellnessEntry> {
    const res = await apiRequest<DailyWellnessEntry>(`/wellness/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
    return res.data
  },

  async deleteWellnessLog(id: string): Promise<boolean> {
    await apiRequest(`/wellness/${id}`, { method: 'DELETE' })
    return true
  },

  // 8. Emergency Health Card
  async getEmergencyCard(): Promise<{ data: EmergencyCardInfo; isLive: boolean }> {
    return apiRequest<EmergencyCardInfo>('/emergency', { method: 'GET' }, EMPTY_EMERGENCY_CARD)
  },

  async updateEmergencyCard(card: Partial<EmergencyCardInfo>): Promise<EmergencyCardInfo> {
    const res = await apiRequest<EmergencyCardInfo>('/emergency', {
      method: 'PUT',
      body: JSON.stringify(card),
    })
    return res.data
  },

  // 9. AI Report Explainer
  async getExplainerDocs(): Promise<{ data: ReportExplainerDocument[]; isLive: boolean }> {
    return apiRequest<ReportExplainerDocument[]>('/explainer', { method: 'GET' }, [])
  },

  async uploadExplainerReport(doc: Partial<ReportExplainerDocument>): Promise<ReportExplainerDocument> {
    const res = await apiRequest<ReportExplainerDocument>('/explainer/upload', {
      method: 'POST',
      body: JSON.stringify(doc),
    })
    return res.data
  },

  async updateAnalyteCorrection(
    docId: string,
    analyteId: string,
    updatedData: any
  ): Promise<ReportExplainerDocument> {
    const res = await apiRequest<ReportExplainerDocument>(`/explainer/${docId}/analytes/${analyteId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    })
    return res.data
  },

  // 10. Unknown-Condition Alerts
  async getUnknownAlerts(): Promise<{ data: UnknownConditionAlertItem[]; isLive: boolean }> {
    return apiRequest<UnknownConditionAlertItem[]>('/unknown-alerts', { method: 'GET' }, [])
  },

  async toggleAlertReview(id: string): Promise<UnknownConditionAlertItem> {
    const res = await apiRequest<UnknownConditionAlertItem>(`/unknown-alerts/${id}/toggle-review`, {
      method: 'PATCH',
    })
    return res.data
  },

  async testUncertaintyScenario(scenarioType: string, inputString?: string): Promise<any> {
    const res = await apiRequest<any>('/unknown-alerts/test', {
      method: 'POST',
      body: JSON.stringify({ scenarioType, inputString }),
    })
    return res.data
  },

  // 11. Ask Health Copilot
  async askCopilot(question: string): Promise<{ answer: string; citations?: string[]; suggestedFollowUps?: string[] }> {
    const res = await apiRequest<{ answer: string; citations?: string[]; suggestedFollowUps?: string[] }>(
      '/copilot/query',
      {
        method: 'POST',
        body: JSON.stringify({ question }),
      }
    )
    return res.data
  },
}
