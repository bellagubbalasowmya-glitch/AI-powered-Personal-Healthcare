import { getSupabase, isSupabaseConfigured, resolveUserUUID, DEMO_USER_UUID } from '../config/supabase.js'
import {
  DEMO_USER,
  INITIAL_SEED_RECORDS,
  INITIAL_SEED_TIMELINE,
  INITIAL_SEED_REMINDERS,
  INITIAL_SEED_VITALS,
  INITIAL_SEED_APPOINTMENTS,
  INITIAL_SEED_EMERGENCY_CARD,
  INITIAL_SEED_WELLNESS,
  INITIAL_SEED_EXPLAINER,
  INITIAL_SEED_ALERTS,
} from './seedData.js'

export class DatabaseError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 503) {
    super(message)
    this.name = 'DatabaseError'
    this.statusCode = statusCode
  }
}

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new DatabaseError(
      'Database connection unavailable: Supabase is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env',
      503
    )
  }
  return getSupabase()
}

// ============================================================================
// PROFILES & USER REPOSITORY
// ============================================================================

export const ensureProfileExists = async (userId: string, name = 'Alex Morgan', email = 'alex.morgan@healthtwin.demo') => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userUUID).maybeSingle()
  if (!existing) {
    await supabase.from('profiles').insert({
      id: userUUID,
      patient_id: 'SYN-PT-89420',
      name,
      email,
      age: 38,
      gender: 'Female',
      role: 'patient',
    })
  }
  return userUUID
}

export const findProfileByEmail = async (email: string) => {
  const supabase = ensureSupabase()
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase().trim()).maybeSingle()
  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return data
}

export const createProfile = async (payload: { id?: string; name: string; email: string; patient_id: string; role?: string }) => {
  const supabase = ensureSupabase()
  const { data, error } = await supabase.from('profiles').insert(payload).select().single()
  if (error) throw new DatabaseError(`Failed to create profile in Supabase: ${error.message}`, 400)
  return data
}

// ============================================================================
// MEDICAL RECORDS REPOSITORY
// ============================================================================

const mapRecordFromDB = (r: any) => ({
  id: r.id,
  legacyId: r.legacy_id,
  userId: r.user_id,
  name: r.name,
  category: r.category,
  recordDate: r.record_date,
  facility: r.facility,
  clinician: r.clinician,
  fileSize: r.file_size,
  fileType: r.file_type,
  processingStatus: r.processing_status,
  summary: r.summary,
  isSynthetic: r.is_synthetic,
  extractedFields: r.extracted_fields || [],
  medications: r.medications || [],
  keyFindings: r.key_findings || [],
  clinicianDiscussionQuestions: r.clinician_discussion_questions || [],
  terminologyGlossary: r.terminology_glossary || [],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export const getRecordsFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', userUUID)
    .order('record_date', { ascending: false })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapRecordFromDB)
}

export const getRecordByIdFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  // Query by UUID id or legacy_id
  const query = supabase.from('medical_records').select('*').eq('user_id', userUUID)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

  const { data, error } = isUUID ? await query.eq('id', id).maybeSingle() : await query.eq('legacy_id', id).maybeSingle()

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return data ? mapRecordFromDB(data) : null
}

export const createRecordInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const dbRow = {
    user_id: userUUID,
    legacy_id: payload.id || `rec-${Date.now()}`,
    name: payload.name,
    category: payload.category,
    record_date: payload.recordDate,
    facility: payload.facility || 'Local Clinical Upload',
    clinician: payload.clinician || 'Attending Physician',
    file_size: payload.fileSize || '1.1 MB',
    file_type: payload.fileType || 'PDF',
    processing_status: payload.processingStatus || 'Processed (Demo)',
    summary: payload.summary || `Clinical document recorded on ${payload.recordDate}.`,
    is_synthetic: payload.isSynthetic !== undefined ? payload.isSynthetic : true,
    extracted_fields: payload.extractedFields || [],
    medications: payload.medications || [],
    key_findings: payload.keyFindings || [],
    clinician_discussion_questions: payload.clinicianDiscussionQuestions || [],
    terminology_glossary: payload.terminologyGlossary || [],
  }

  const { data, error } = await supabase.from('medical_records').insert(dbRow).select().single()
  if (error) throw new DatabaseError(`Failed to save record in Supabase: ${error.message}`, 400)

  // Auto-generate linked timeline event
  await createTimelineEventInDB(
    {
      title: `${payload.name} Uploaded`,
      eventType: payload.category,
      date: payload.recordDate,
      source: payload.facility || 'Apex Diagnostics',
      description: payload.summary || 'Medical document recorded.',
      relatedRecordId: data.id,
      tags: ['Document', payload.category],
      severity: 'neutral',
    },
    userUUID
  )

  return mapRecordFromDB(data)
}

export const updateRecordInDB = async (id: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const updateFields: any = { updated_at: new Date().toISOString() }
  if (payload.name !== undefined) updateFields.name = payload.name
  if (payload.category !== undefined) updateFields.category = payload.category
  if (payload.recordDate !== undefined) updateFields.record_date = payload.recordDate
  if (payload.facility !== undefined) updateFields.facility = payload.facility
  if (payload.clinician !== undefined) updateFields.clinician = payload.clinician
  if (payload.summary !== undefined) updateFields.summary = payload.summary
  if (payload.extractedFields !== undefined) updateFields.extracted_fields = payload.extractedFields
  if (payload.medications !== undefined) updateFields.medications = payload.medications
  if (payload.keyFindings !== undefined) updateFields.key_findings = payload.keyFindings
  if (payload.clinicianDiscussionQuestions !== undefined) {
    updateFields.clinician_discussion_questions = payload.clinicianDiscussionQuestions
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('medical_records').update(updateFields).eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select().maybeSingle() : await query.eq('legacy_id', id).select().maybeSingle()

  if (error) throw new DatabaseError(`Failed to update record in Supabase: ${error.message}`)
  return data ? mapRecordFromDB(data) : null
}

export const deleteRecordFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('medical_records').delete().eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select() : await query.eq('legacy_id', id).select()

  if (error) throw new DatabaseError(`Failed to delete record in Supabase: ${error.message}`)
  if (!data || data.length === 0) return false

  // Clean up linked timeline events
  await supabase.from('timeline_events').delete().eq('user_id', userUUID).eq('related_record_id', id)
  return true
}

// ============================================================================
// TIMELINE EVENTS REPOSITORY
// ============================================================================

const mapTimelineFromDB = (t: any) => ({
  id: t.id,
  legacyId: t.legacy_id,
  userId: t.user_id,
  title: t.title,
  eventType: t.event_type,
  date: t.event_date,
  source: t.source,
  description: t.description,
  relatedRecordId: t.related_record_id,
  tags: t.tags || [],
  severity: t.severity,
  createdAt: t.created_at,
})

export const getTimelineFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('user_id', userUUID)
    .order('event_date', { ascending: false })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapTimelineFromDB)
}

export const createTimelineEventInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const dbRow = {
    user_id: userUUID,
    legacy_id: payload.id || `evt-${Date.now()}`,
    title: payload.title,
    event_type: payload.eventType || 'General Event',
    event_date: payload.date,
    source: payload.source || 'Personal Health Entry',
    description: payload.description || '',
    related_record_id: payload.relatedRecordId ? String(payload.relatedRecordId) : null,
    tags: payload.tags || [],
    severity: payload.severity || 'neutral',
  }

  const { data, error } = await supabase.from('timeline_events').insert(dbRow).select().single()
  if (error) throw new DatabaseError(`Failed to save timeline event: ${error.message}`)
  return mapTimelineFromDB(data)
}

// ============================================================================
// MEDICINE REMINDERS REPOSITORY
// ============================================================================

const mapReminderFromDB = (r: any) => ({
  id: r.id,
  legacyId: r.legacy_id,
  userId: r.user_id,
  medicineName: r.medicine_name,
  prescribedDosage: r.prescribed_dosage,
  scheduleTime: r.schedule_time,
  timeString: r.time_string,
  frequency: r.frequency,
  startDate: r.start_date,
  endDate: r.end_date,
  instructions: r.instructions,
  status: r.status,
  lastTakenTimestamp: r.last_taken_timestamp,
  notes: r.notes,
  createdAt: r.created_at,
})

export const getRemindersFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('medicine_reminders')
    .select('*')
    .eq('user_id', userUUID)
    .order('time_string', { ascending: true })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapReminderFromDB)
}

export const createReminderInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const dbRow = {
    user_id: userUUID,
    legacy_id: payload.id || `rem-${Date.now()}`,
    medicine_name: payload.medicineName.trim(),
    prescribed_dosage: payload.prescribedDosage.trim(),
    schedule_time: payload.scheduleTime || 'Morning',
    time_string: payload.timeString || '08:00 AM',
    frequency: payload.frequency || 'Once Daily',
    start_date: payload.startDate,
    end_date: payload.endDate || null,
    instructions: payload.instructions || '',
    status: payload.status || 'Pending',
    notes: payload.notes || null,
  }

  const { data, error } = await supabase.from('medicine_reminders').insert(dbRow).select().single()
  if (error) throw new DatabaseError(`Failed to save reminder in Supabase: ${error.message}`)
  return mapReminderFromDB(data)
}

export const updateReminderInDB = async (id: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const updateFields: any = { updated_at: new Date().toISOString() }
  if (payload.medicineName !== undefined) updateFields.medicine_name = payload.medicineName
  if (payload.prescribedDosage !== undefined) updateFields.prescribed_dosage = payload.prescribedDosage
  if (payload.scheduleTime !== undefined) updateFields.schedule_time = payload.scheduleTime
  if (payload.timeString !== undefined) updateFields.time_string = payload.timeString
  if (payload.frequency !== undefined) updateFields.frequency = payload.frequency
  if (payload.startDate !== undefined) updateFields.start_date = payload.startDate
  if (payload.endDate !== undefined) updateFields.end_date = payload.endDate
  if (payload.instructions !== undefined) updateFields.instructions = payload.instructions
  if (payload.status !== undefined) {
    updateFields.status = payload.status
    if (payload.status === 'Taken' && !payload.lastTakenTimestamp) {
      updateFields.last_taken_timestamp = new Date().toISOString()
    }
  }
  if (payload.lastTakenTimestamp !== undefined) updateFields.last_taken_timestamp = payload.lastTakenTimestamp
  if (payload.notes !== undefined) updateFields.notes = payload.notes

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('medicine_reminders').update(updateFields).eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select().maybeSingle() : await query.eq('legacy_id', id).select().maybeSingle()

  if (error) throw new DatabaseError(`Failed to update reminder: ${error.message}`)
  return data ? mapReminderFromDB(data) : null
}

export const deleteReminderFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('medicine_reminders').delete().eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select() : await query.eq('legacy_id', id).select()

  if (error) throw new DatabaseError(`Failed to delete reminder: ${error.message}`)
  return Boolean(data && data.length > 0)
}

// ============================================================================
// VITALS MEASUREMENTS REPOSITORY
// ============================================================================

const mapVitalFromDB = (v: any) => ({
  id: v.id,
  legacyId: v.legacy_id,
  userId: v.user_id,
  date: v.measured_date,
  time: v.measured_time,
  systolic: v.systolic,
  diastolic: v.diastolic,
  pulse: v.pulse,
  temperature: Number(v.temperature),
  temperatureUnit: v.temperature_unit,
  oxygenSaturation: v.oxygen_saturation,
  notes: v.notes,
  cautiousAlert: v.cautious_alert,
  isCautious: v.is_cautious,
  createdAt: v.created_at,
})

export const getVitalsFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('vital_measurements')
    .select('*')
    .eq('user_id', userUUID)
    .order('measured_date', { ascending: false })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapVitalFromDB)
}

export const createVitalInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const dbRow = {
    user_id: userUUID,
    legacy_id: payload.id || `vit-${Date.now()}`,
    measured_date: payload.date,
    measured_time: payload.time || '08:00 AM',
    systolic: Number(payload.systolic),
    diastolic: Number(payload.diastolic),
    pulse: Number(payload.pulse),
    temperature: Number(payload.temperature),
    temperature_unit: payload.temperatureUnit || '°F',
    oxygen_saturation: Number(payload.oxygenSaturation),
    notes: payload.notes || null,
    cautious_alert: payload.cautiousAlert || null,
    is_cautious: Boolean(payload.isCautious),
  }

  const { data, error } = await supabase.from('vital_measurements').insert(dbRow).select().single()
  if (error) throw new DatabaseError(`Failed to save vital measurement: ${error.message}`)
  return mapVitalFromDB(data)
}

export const deleteVitalFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('vital_measurements').delete().eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select() : await query.eq('legacy_id', id).select()

  if (error) throw new DatabaseError(`Failed to delete vital measurement: ${error.message}`)
  return Boolean(data && data.length > 0)
}

// ============================================================================
// DOCTOR APPOINTMENTS REPOSITORY
// ============================================================================

const mapAppointmentFromDB = (a: any) => ({
  id: a.id,
  legacyId: a.legacy_id,
  userId: a.user_id,
  doctorName: a.doctor_name,
  specialty: a.specialty,
  date: a.appointment_date,
  time: a.appointment_time,
  durationMinutes: a.duration_minutes,
  clinicHospital: a.clinic_hospital,
  location: a.location,
  visitType: a.visit_type,
  reason: a.reason,
  preparationNotes: a.preparation_notes,
  status: a.status,
  isLocalDemo: a.is_local_demo,
  createdAt: a.created_at,
})

export const getAppointmentsFromDB = async (userId: string, filter?: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  let query = supabase
    .from('doctor_appointments')
    .select('*')
    .eq('user_id', userUUID)
    .order('appointment_date', { ascending: true })

  const todayStr = new Date().toISOString().split('T')[0]

  if (filter === 'upcoming') {
    query = query.gte('appointment_date', todayStr).neq('status', 'Completed').neq('status', 'Cancelled')
  } else if (filter === 'past') {
    query = query.or(`appointment_date.lt.${todayStr},status.eq.Completed,status.eq.Cancelled`)
  }

  const { data, error } = await query
  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapAppointmentFromDB)
}

export const createAppointmentInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const dbRow = {
    user_id: userUUID,
    legacy_id: payload.id || `apt-${Date.now()}`,
    doctor_name: payload.doctorName,
    specialty: payload.specialty || 'General Medicine',
    appointment_date: payload.date,
    appointment_time: payload.time,
    duration_minutes: Number(payload.durationMinutes) || 30,
    clinic_hospital: payload.clinicHospital || 'Community Health Clinic',
    location: payload.location || '',
    visit_type: payload.visitType || 'In-Person',
    reason: payload.reason,
    preparation_notes: payload.preparationNotes || '',
    status: payload.status || 'Confirmed (Local Demo)',
    is_local_demo: true,
  }

  const { data, error } = await supabase.from('doctor_appointments').insert(dbRow).select().single()
  if (error) throw new DatabaseError(`Failed to save appointment in Supabase: ${error.message}`)
  return mapAppointmentFromDB(data)
}

export const updateAppointmentInDB = async (id: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const updateFields: any = { updated_at: new Date().toISOString() }
  if (payload.doctorName !== undefined) updateFields.doctor_name = payload.doctorName
  if (payload.specialty !== undefined) updateFields.specialty = payload.specialty
  if (payload.date !== undefined) updateFields.appointment_date = payload.date
  if (payload.time !== undefined) updateFields.appointment_time = payload.time
  if (payload.durationMinutes !== undefined) updateFields.duration_minutes = Number(payload.durationMinutes)
  if (payload.clinicHospital !== undefined) updateFields.clinic_hospital = payload.clinicHospital
  if (payload.location !== undefined) updateFields.location = payload.location
  if (payload.visitType !== undefined) updateFields.visit_type = payload.visitType
  if (payload.reason !== undefined) updateFields.reason = payload.reason
  if (payload.preparationNotes !== undefined) updateFields.preparation_notes = payload.preparationNotes
  if (payload.status !== undefined) updateFields.status = payload.status

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('doctor_appointments').update(updateFields).eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select().maybeSingle() : await query.eq('legacy_id', id).select().maybeSingle()

  if (error) throw new DatabaseError(`Failed to update appointment: ${error.message}`)
  return data ? mapAppointmentFromDB(data) : null
}

export const deleteAppointmentFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('doctor_appointments').delete().eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select() : await query.eq('legacy_id', id).select()

  if (error) throw new DatabaseError(`Failed to delete appointment: ${error.message}`)
  return Boolean(data && data.length > 0)
}

// ============================================================================
// WELLNESS ENTRIES REPOSITORY
// ============================================================================

const mapWellnessFromDB = (w: any) => ({
  id: w.id,
  legacyId: w.legacy_id,
  userId: w.user_id,
  date: w.entry_date,
  sleepHours: Number(w.sleep_hours),
  sleepQuality: w.sleep_quality,
  waterGlasses: w.water_glasses,
  waterTarget: w.water_target,
  activeMinutes: w.active_minutes,
  habits: w.habits || [],
  moodNote: w.mood_note,
  createdAt: w.created_at,
})

export const getWellnessFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('wellness_entries')
    .select('*')
    .eq('user_id', userUUID)
    .order('entry_date', { ascending: false })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapWellnessFromDB)
}

export const createWellnessInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const dbRow = {
    user_id: userUUID,
    legacy_id: payload.id || `wlog-${Date.now()}`,
    entry_date: payload.date,
    sleep_hours: Number(payload.sleepHours),
    sleep_quality: payload.sleepQuality || 'Restful',
    water_glasses: Number(payload.waterGlasses) || 0,
    water_target: Number(payload.waterTarget) || 8,
    active_minutes: Number(payload.activeMinutes) || 0,
    habits: payload.habits || [],
    mood_note: payload.moodNote || null,
  }

  const { data, error } = await supabase.from('wellness_entries').insert(dbRow).select().single()
  if (error) throw new DatabaseError(`Failed to save wellness entry in Supabase: ${error.message}`)
  return mapWellnessFromDB(data)
}

export const updateWellnessInDB = async (id: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const updateFields: any = { updated_at: new Date().toISOString() }
  if (payload.date !== undefined) updateFields.entry_date = payload.date
  if (payload.sleepHours !== undefined) updateFields.sleep_hours = Number(payload.sleepHours)
  if (payload.sleepQuality !== undefined) updateFields.sleep_quality = payload.sleepQuality
  if (payload.waterGlasses !== undefined) updateFields.water_glasses = Number(payload.waterGlasses)
  if (payload.waterTarget !== undefined) updateFields.water_target = Number(payload.waterTarget)
  if (payload.activeMinutes !== undefined) updateFields.active_minutes = Number(payload.activeMinutes)
  if (payload.habits !== undefined) updateFields.habits = payload.habits
  if (payload.moodNote !== undefined) updateFields.mood_note = payload.moodNote

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('wellness_entries').update(updateFields).eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select().maybeSingle() : await query.eq('legacy_id', id).select().maybeSingle()

  if (error) throw new DatabaseError(`Failed to update wellness entry: ${error.message}`)
  return data ? mapWellnessFromDB(data) : null
}

export const deleteWellnessFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const query = supabase.from('wellness_entries').delete().eq('user_id', userUUID)

  const { data, error } = isUUID ? await query.eq('id', id).select() : await query.eq('legacy_id', id).select()

  if (error) throw new DatabaseError(`Failed to delete wellness entry: ${error.message}`)
  return Boolean(data && data.length > 0)
}

// ============================================================================
// EMERGENCY CARD REPOSITORY
// ============================================================================

const mapEmergencyCardFromDB = (e: any) => ({
  id: e.id,
  userId: e.user_id,
  patientName: e.patient_name,
  patientId: e.patient_id,
  age: e.age,
  gender: e.gender,
  bloodGroup: e.blood_group,
  allergies: e.allergies || [],
  chronicConditions: e.chronic_conditions || [],
  criticalMedications: e.critical_medications || [],
  emergencyContacts: e.emergency_contacts || [],
  primaryPhysician: e.primary_physician || {},
  preferredHospital: e.preferred_hospital || '',
  organDonor: e.organ_donor || false,
  medicalNotes: e.medical_notes || '',
  lastUpdated: e.last_updated || '',
})

export const getEmergencyCardFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  let { data, error } = await supabase.from('emergency_cards').select('*').eq('user_id', userUUID).maybeSingle()

  if (!data) {
    // Seed default emergency card
    const seed = INITIAL_SEED_EMERGENCY_CARD
    const insertRow = {
      user_id: userUUID,
      patient_name: seed.patientName,
      patient_id: seed.patientId,
      age: seed.age,
      gender: seed.gender,
      blood_group: seed.bloodGroup,
      allergies: seed.allergies,
      chronic_conditions: seed.chronicConditions,
      critical_medications: seed.criticalMedications,
      emergency_contacts: seed.emergencyContacts,
      primary_physician: seed.primaryPhysician,
      preferred_hospital: seed.preferredHospital,
      organ_donor: seed.organDonor,
      medical_notes: seed.medicalNotes,
      last_updated: seed.lastUpdated,
    }
    const created = await supabase.from('emergency_cards').insert(insertRow).select().single()
    data = created.data
  }

  return mapEmergencyCardFromDB(data)
}

export const updateEmergencyCardInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const updateFields: any = {
    updated_at: new Date().toISOString(),
    last_updated: new Date().toLocaleDateString('en-US') + ' (Verified)',
  }

  if (payload.patientName !== undefined) updateFields.patient_name = payload.patientName
  if (payload.age !== undefined) updateFields.age = Number(payload.age)
  if (payload.gender !== undefined) updateFields.gender = payload.gender
  if (payload.bloodGroup !== undefined) updateFields.blood_group = payload.bloodGroup
  if (payload.allergies !== undefined) updateFields.allergies = payload.allergies
  if (payload.chronicConditions !== undefined) updateFields.chronic_conditions = payload.chronicConditions
  if (payload.criticalMedications !== undefined) updateFields.critical_medications = payload.criticalMedications
  if (payload.emergencyContacts !== undefined) updateFields.emergency_contacts = payload.emergencyContacts
  if (payload.primaryPhysician !== undefined) updateFields.primary_physician = payload.primaryPhysician
  if (payload.preferredHospital !== undefined) updateFields.preferred_hospital = payload.preferredHospital
  if (payload.organDonor !== undefined) updateFields.organ_donor = payload.organDonor
  if (payload.medicalNotes !== undefined) updateFields.medical_notes = payload.medicalNotes

  const { data, error } = await supabase
    .from('emergency_cards')
    .upsert({ user_id: userUUID, ...updateFields }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw new DatabaseError(`Failed to update emergency card: ${error.message}`)
  return mapEmergencyCardFromDB(data)
}

// ============================================================================
// REPORT EXPLAINERS & ANALYTES REPOSITORY
// ============================================================================

export const getExplainersFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data: explainers, error } = await supabase
    .from('report_explainers')
    .select('*, report_analytes(*)')
    .eq('user_id', userUUID)
    .order('upload_date', { ascending: false })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)

  return (explainers || []).map((e: any) => ({
    id: e.id,
    legacyId: e.legacy_id,
    fileName: e.file_name,
    fileSize: e.file_size,
    uploadDate: e.upload_date,
    category: e.category,
    extractionStatus: e.extraction_status,
    analytes: (e.report_analytes || []).map((a: any) => ({
      id: a.id,
      legacyId: a.legacy_id,
      testName: a.test_name,
      value: a.value,
      unit: a.unit,
      referenceRange: a.reference_range,
      status: a.status,
      category: a.category,
      interpretationNotes: a.interpretation_notes,
      teluguExplanation: a.telugu_explanation,
    })),
    plainEnglishSummary: e.plain_english_summary,
    teluguSummary: e.telugu_summary,
    terminology: e.terminology || [],
    isDemoSimulation: e.is_demo_simulation,
  }))
}

export const createExplainerInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const explainerRow = {
    user_id: userUUID,
    legacy_id: payload.id || `rep-${Date.now()}`,
    file_name: payload.fileName,
    file_size: payload.fileSize || '1.2 MB',
    upload_date: payload.uploadDate || new Date().toISOString().split('T')[0],
    category: payload.category || 'Biochemical Panel',
    extraction_status: payload.extractionStatus || 'Complete (Demo)',
    plain_english_summary: payload.plainEnglishSummary || '',
    telugu_summary: payload.teluguSummary || '',
    terminology: payload.terminology || [],
    is_demo_simulation: true,
  }

  const { data: createdExplainer, error } = await supabase
    .from('report_explainers')
    .insert(explainerRow)
    .select()
    .single()

  if (error) throw new DatabaseError(`Failed to save report explainer: ${error.message}`)

  // Insert analytes if provided
  if (Array.isArray(payload.analytes) && payload.analytes.length > 0) {
    const analyteRows = payload.analytes.map((a: any) => ({
      report_id: createdExplainer.id,
      user_id: userUUID,
      legacy_id: a.id || `an-${Date.now()}`,
      test_name: a.testName,
      value: String(a.value),
      unit: a.unit,
      reference_range: a.referenceRange,
      status: a.status,
      category: a.category || 'General',
      interpretation_notes: a.interpretationNotes || null,
      telugu_explanation: a.teluguExplanation || null,
    }))

    await supabase.from('report_analytes').insert(analyteRows)
  }

  const result = await getExplainersFromDB(userUUID)
  return result.find((e: any) => e.id === createdExplainer.id) || result[0]
}

export const updateAnalyteCorrectionInDB = async (
  docId: string,
  analyteId: string,
  payload: any,
  userId: string
) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const updateFields: any = { updated_at: new Date().toISOString() }
  if (payload.testName !== undefined) updateFields.test_name = payload.testName
  if (payload.value !== undefined) updateFields.value = String(payload.value)
  if (payload.unit !== undefined) updateFields.unit = payload.unit
  if (payload.referenceRange !== undefined) updateFields.reference_range = payload.referenceRange
  if (payload.status !== undefined) updateFields.status = payload.status
  if (payload.interpretationNotes !== undefined) updateFields.interpretation_notes = payload.interpretationNotes

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(analyteId)
  const query = supabase.from('report_analytes').update(updateFields).eq('user_id', userUUID)

  const { error } = isUUID ? await query.eq('id', analyteId) : await query.eq('legacy_id', analyteId)
  if (error) throw new DatabaseError(`Failed to update analyte correction: ${error.message}`)

  const explainers = await getExplainersFromDB(userUUID)
  const isDocUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(docId)
  return explainers.find((d: any) => (isDocUUID ? d.id === docId : d.legacyId === docId || d.id === docId)) || explainers[0]
}

// ============================================================================
// UNKNOWN CONDITION ALERTS REPOSITORY
// ============================================================================

const mapAlertFromDB = (a: any) => ({
  id: a.id,
  legacyId: a.legacy_id,
  userId: a.user_id,
  sourceDocument: a.source_document,
  testOrFinding: a.test_or_finding,
  detectionDate: a.detection_date,
  status: a.status,
  confidenceLabel: a.confidence_label,
  uncertaintyReason: a.uncertainty_reason,
  missingParameters: a.missing_parameters || [],
  clinicianDiscussionRecommendation: a.clinician_discussion_recommendation,
  hasBeenReviewed: a.has_been_reviewed,
  createdAt: a.created_at,
})

export const getUnknownAlertsFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('unknown_condition_alerts')
    .select('*')
    .eq('user_id', userUUID)
    .order('detection_date', { ascending: false })

  if (error) throw new DatabaseError(`Supabase query failed: ${error.message}`)
  return (data || []).map(mapAlertFromDB)
}

export const toggleAlertReviewedInDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const selectQuery = supabase.from('unknown_condition_alerts').select('has_been_reviewed').eq('user_id', userUUID)
  const { data: existing } = isUUID ? await selectQuery.eq('id', id).maybeSingle() : await selectQuery.eq('legacy_id', id).maybeSingle()

  if (!existing) return null

  const newReviewed = !existing.has_been_reviewed
  const updateQuery = supabase
    .from('unknown_condition_alerts')
    .update({ has_been_reviewed: newReviewed, updated_at: new Date().toISOString() })
    .eq('user_id', userUUID)

  const { data, error } = isUUID ? await updateQuery.eq('id', id).select().maybeSingle() : await updateQuery.eq('legacy_id', id).select().maybeSingle()

  if (error) throw new DatabaseError(`Failed to update alert in Supabase: ${error.message}`)
  return data ? mapAlertFromDB(data) : null
}

// ============================================================================
// SEED INITIAL DATASET INTO SUPABASE
// ============================================================================

export const seedSupabaseData = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.log('[Seed] Supabase not configured. Skipping seed.')
    return false
  }

  try {
    const supabase = ensureSupabase()
    console.log('[Seed] Checking public.profiles in Supabase PostgreSQL...')

    await ensureProfileExists(DEMO_USER_UUID, DEMO_USER.name, DEMO_USER.email)

    // Check if records table is empty
    const { count } = await supabase
      .from('medical_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', DEMO_USER_UUID)

    if (count && count > 0) {
      console.log(`[Seed] Supabase already contains ${count} records. Skipping automatic re-seed.`)
      return true
    }

    console.log('[Seed] Seeding synthetic patient demo dataset into Supabase PostgreSQL...')

    // 1. Medical records
    for (const r of INITIAL_SEED_RECORDS) {
      await supabase.from('medical_records').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: r.id,
        name: r.name,
        category: r.category,
        record_date: r.recordDate,
        facility: r.facility,
        clinician: r.clinician,
        file_size: r.fileSize,
        file_type: r.fileType,
        processing_status: r.processingStatus,
        summary: r.summary,
        is_synthetic: r.isSynthetic,
        extracted_fields: r.extractedFields,
        medications: (r as any).medications || [],
        key_findings: r.keyFindings,
        clinician_discussion_questions: r.clinicianDiscussionQuestions,
        terminology_glossary: (r as any).terminologyGlossary || [],
      })
    }

    // 2. Timeline
    for (const t of INITIAL_SEED_TIMELINE) {
      await supabase.from('timeline_events').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: t.id,
        title: t.title,
        event_type: t.eventType,
        event_date: t.date,
        source: t.source,
        description: t.description,
        related_record_id: t.relatedRecordId,
        tags: t.tags,
        severity: t.severity,
      })
    }

    // 3. Reminders
    for (const m of INITIAL_SEED_REMINDERS) {
      await supabase.from('medicine_reminders').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: m.id,
        medicine_name: m.medicineName,
        prescribed_dosage: m.prescribedDosage,
        schedule_time: m.scheduleTime,
        time_string: m.timeString,
        frequency: m.frequency,
        start_date: m.startDate,
        end_date: (m as any).endDate || null,
        instructions: m.instructions,
        status: m.status,
        notes: m.notes || null,
      })
    }

    // 4. Vitals
    for (const v of INITIAL_SEED_VITALS) {
      await supabase.from('vital_measurements').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: v.id,
        measured_date: v.date,
        measured_time: v.time,
        systolic: v.systolic,
        diastolic: v.diastolic,
        pulse: v.pulse,
        temperature: v.temperature,
        temperature_unit: v.temperatureUnit,
        oxygen_saturation: v.oxygenSaturation,
        notes: v.notes || null,
        cautious_alert: v.cautiousAlert || null,
        is_cautious: v.isCautious,
      })
    }

    // 5. Appointments
    for (const a of INITIAL_SEED_APPOINTMENTS) {
      await supabase.from('doctor_appointments').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: a.id,
        doctor_name: a.doctorName,
        specialty: a.specialty,
        appointment_date: a.date,
        appointment_time: a.time,
        duration_minutes: a.durationMinutes,
        clinic_hospital: a.clinicHospital,
        location: a.location,
        visit_type: a.visitType,
        reason: a.reason,
        preparation_notes: a.preparationNotes,
        status: a.status,
        is_local_demo: true,
      })
    }

    // 6. Emergency Card
    await updateEmergencyCardInDB(INITIAL_SEED_EMERGENCY_CARD, DEMO_USER_UUID)

    // 7. Wellness
    for (const w of INITIAL_SEED_WELLNESS) {
      await supabase.from('wellness_entries').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: w.id,
        entry_date: w.date,
        sleep_hours: w.sleepHours,
        sleep_quality: w.sleepQuality,
        water_glasses: w.waterGlasses,
        water_target: w.waterTarget,
        active_minutes: w.activeMinutes,
        habits: w.habits,
        mood_note: w.moodNote || null,
      })
    }

    // 8. Explainers
    for (const e of INITIAL_SEED_EXPLAINER) {
      await createExplainerInDB(e, DEMO_USER_UUID)
    }

    // 9. Alerts
    for (const al of INITIAL_SEED_ALERTS) {
      await supabase.from('unknown_condition_alerts').insert({
        user_id: DEMO_USER_UUID,
        legacy_id: al.id,
        source_document: al.sourceDocument,
        test_or_finding: al.testOrFinding,
        detection_date: al.detectionDate,
        status: al.status,
        confidence_label: al.confidenceLabel,
        uncertainty_reason: al.uncertaintyReason,
        missing_parameters: al.missingParameters,
        clinician_discussion_recommendation: al.clinicianDiscussionRecommendation,
        has_been_reviewed: al.hasBeenReviewed,
      })
    }

    console.log('[Seed] Supabase PostgreSQL seeded successfully with 10 modules!')
    return true
  } catch (err: any) {
    console.error('[Seed Error]:', err.message)
    return false
  }
}

// ============================================================================
// EXTENDED REPOSITORY METHODS (Full REST API Support)
// ============================================================================

export const getProfileFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userUUID).single()
  if (error) throw new DatabaseError(`Failed to fetch profile: ${error.message}`)
  return data
}

export const updateProfileInDB = async (userId: string, payload: any) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const updateFields: any = { updated_at: new Date().toISOString() }
  if (payload.full_name !== undefined) updateFields.full_name = payload.full_name
  if (payload.name !== undefined) updateFields.full_name = payload.name
  if (payload.preferred_name !== undefined) updateFields.preferred_name = payload.preferred_name
  if (payload.date_of_birth !== undefined) updateFields.date_of_birth = payload.date_of_birth
  if (payload.blood_group !== undefined) updateFields.blood_group = payload.blood_group
  if (payload.height_cm !== undefined) updateFields.height_cm = Number(payload.height_cm)
  if (payload.preferred_language !== undefined) updateFields.preferred_language = payload.preferred_language
  if (payload.timezone !== undefined) updateFields.timezone = payload.timezone
  if (payload.emergency_contact_name !== undefined) updateFields.emergency_contact_name = payload.emergency_contact_name
  if (payload.emergency_contact_phone !== undefined) updateFields.emergency_contact_phone = payload.emergency_contact_phone
  if (payload.emergency_contact_relationship !== undefined) updateFields.emergency_contact_relationship = payload.emergency_contact_relationship

  const { data, error } = await supabase.from('profiles').update(updateFields).eq('id', userUUID).select().single()
  if (error) throw new DatabaseError(`Failed to update profile: ${error.message}`)
  return data
}

export const getRecordFileSignedUrl = async (storagePath: string) => {
  const supabase = ensureSupabase()
  const { data, error } = await supabase.storage.from('medical-records').createSignedUrl(storagePath, 3600)
  if (error) throw new DatabaseError(`Failed to generate signed URL: ${error.message}`)
  return data.signedUrl
}

export const getMetricsFromDB = async (userId: string, metricType?: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  let query = supabase.from('health_metrics').select('*').eq('user_id', userUUID).order('measured_at', { ascending: false })
  if (metricType) {
    query = query.eq('metric_type', metricType)
  }

  const { data, error } = await query
  if (error) throw new DatabaseError(`Failed to fetch health metrics: ${error.message}`)
  return data || []
}

export const createMetricInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const row = {
    user_id: userUUID,
    metric_type: payload.metric_type || payload.metricType || 'general',
    value_numeric: payload.value_numeric !== undefined ? Number(payload.value_numeric) : (payload.valueNumeric ? Number(payload.valueNumeric) : null),
    value_text: payload.value_text || payload.valueText || null,
    unit: payload.unit || null,
    measured_at: payload.measured_at || payload.measuredAt || new Date().toISOString(),
    source: payload.source || 'manual',
    notes: payload.notes || null,
    medical_record_id: payload.medical_record_id || payload.medicalRecordId || null,
    systolic: payload.systolic !== undefined ? Number(payload.systolic) : null,
    diastolic: payload.diastolic !== undefined ? Number(payload.diastolic) : null,
    pulse: payload.pulse !== undefined ? Number(payload.pulse) : null,
    temperature: payload.temperature !== undefined ? Number(payload.temperature) : null,
    temperature_unit: payload.temperature_unit || payload.temperatureUnit || '°F',
    oxygen_saturation: payload.oxygen_saturation !== undefined ? Number(payload.oxygen_saturation) : null,
    is_cautious: Boolean(payload.is_cautious || payload.isCautious),
    cautious_alert: payload.cautious_alert || payload.cautiousAlert || null,
  }

  const { data, error } = await supabase.from('health_metrics').insert(row).select().single()
  if (error) throw new DatabaseError(`Failed to create health metric: ${error.message}`)
  return data
}

export const deleteMetricFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const { data, error } = await supabase.from('health_metrics').delete().eq('user_id', userUUID).eq(isUUID ? 'id' : 'id', id).select()
  if (error) throw new DatabaseError(`Failed to delete health metric: ${error.message}`)
  return Boolean(data && data.length > 0)
}

export const getMetricByIdFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const { data, error } = await supabase.from('health_metrics').select('*').eq('user_id', userUUID).eq('id', id).maybeSingle()
  if (error) throw new DatabaseError(`Failed to fetch health metric: ${error.message}`)
  return data
}

export const updateMetricInDB = async (id: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const updates: any = {}
  if (payload.metric_type !== undefined) updates.metric_type = payload.metric_type
  if (payload.metricType !== undefined) updates.metric_type = payload.metricType
  if (payload.value_numeric !== undefined) updates.value_numeric = Number(payload.value_numeric)
  if (payload.valueNumeric !== undefined) updates.value_numeric = Number(payload.valueNumeric)
  if (payload.value_text !== undefined) updates.value_text = payload.value_text
  if (payload.valueText !== undefined) updates.value_text = payload.valueText
  if (payload.unit !== undefined) updates.unit = payload.unit
  if (payload.notes !== undefined) updates.notes = payload.notes
  if (payload.source !== undefined) updates.source = payload.source

  const { data, error } = await supabase
    .from('health_metrics')
    .update(updates)
    .eq('user_id', userUUID)
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw new DatabaseError(`Failed to update health metric: ${error.message}`)
  return data
}

export const getMedicationsFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase.from('medications').select('*').eq('user_id', userUUID).order('start_date', { ascending: false })
  if (error) throw new DatabaseError(`Failed to fetch medications: ${error.message}`)
  return data || []
}

export const createMedicationInDB = async (payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const row = {
    user_id: userUUID,
    medication_name: payload.medication_name || payload.medicationName,
    dosage: payload.dosage,
    route: payload.route || 'Oral',
    frequency: payload.frequency || 'Daily',
    instructions: payload.instructions || '',
    start_date: payload.start_date || payload.startDate || new Date().toISOString().split('T')[0],
    end_date: payload.end_date || payload.endDate || null,
    prescribed_by: payload.prescribed_by || payload.prescribedBy || null,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    source_record_id: payload.source_record_id || payload.sourceRecordId || null,
  }

  const { data, error } = await supabase.from('medications').insert(row).select().single()
  if (error) throw new DatabaseError(`Failed to create medication: ${error.message}`)
  return data
}

export const updateMedicationInDB = async (id: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const updateFields: any = { updated_at: new Date().toISOString() }

  if (payload.medication_name !== undefined) updateFields.medication_name = payload.medication_name
  if (payload.dosage !== undefined) updateFields.dosage = payload.dosage
  if (payload.frequency !== undefined) updateFields.frequency = payload.frequency
  if (payload.instructions !== undefined) updateFields.instructions = payload.instructions
  if (payload.is_active !== undefined) updateFields.is_active = Boolean(payload.is_active)
  if (payload.end_date !== undefined) updateFields.end_date = payload.end_date

  const { data, error } = await supabase.from('medications').update(updateFields).eq('id', id).eq('user_id', userUUID).select().single()
  if (error) throw new DatabaseError(`Failed to update medication: ${error.message}`)
  return data
}

export const deleteMedicationFromDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const { data, error } = await supabase.from('medications').delete().eq('id', id).eq('user_id', userUUID).select()
  if (error) throw new DatabaseError(`Failed to delete medication: ${error.message}`)
  return Boolean(data && data.length > 0)
}

export const completeReminderInDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const updateFields = {
    is_completed: true,
    status: 'Taken',
    completed_at: new Date().toISOString(),
    last_taken_timestamp: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('reminders').update(updateFields).eq('id', id).eq('user_id', userUUID).select().single()
  if (error) throw new DatabaseError(`Failed to complete reminder: ${error.message}`)
  return data
}

export const getConversationsFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase.from('copilot_conversations').select('*').eq('user_id', userUUID).order('updated_at', { ascending: false })
  if (error) throw new DatabaseError(`Failed to fetch copilot conversations: ${error.message}`)
  return data || []
}

export const createConversationInDB = async (userId: string, title = 'Health Copilot Consultation') => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase.from('copilot_conversations').insert({ user_id: userUUID, title }).select().single()
  if (error) throw new DatabaseError(`Failed to create conversation: ${error.message}`)
  return data
}

export const deleteConversationInDB = async (conversationId: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const { data, error } = await supabase.from('copilot_conversations').delete().eq('id', conversationId).eq('user_id', userUUID).select()
  if (error) throw new DatabaseError(`Failed to delete conversation: ${error.message}`)
  return Boolean(data && data.length > 0)
}

export const getMessagesFromDB = async (conversationId: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('copilot_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', userUUID)
    .order('created_at', { ascending: true })

  if (error) throw new DatabaseError(`Failed to fetch conversation messages: ${error.message}`)
  return data || []
}

export const createMessageInDB = async (conversationId: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const row = {
    conversation_id: conversationId,
    user_id: userUUID,
    role: payload.role || 'user',
    content: payload.content || '',
    referenced_record_ids: payload.referenced_record_ids || [],
    citations: payload.citations || [],
    suggested_follow_ups: payload.suggested_follow_ups || [],
    model_provider: payload.model_provider || 'clinical_guardrails',
    model_name: payload.model_name || 'healthtwin-copilot-v1',
  }

  const { data, error } = await supabase.from('copilot_messages').insert(row).select().single()
  if (error) throw new DatabaseError(`Failed to save message: ${error.message}`)

  // Update conversation updated_at
  await supabase.from('copilot_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)

  return data
}

export const getMedicalSummaryFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('medical_summaries')
    .select('*')
    .eq('user_id', userUUID)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new DatabaseError(`Failed to fetch medical summary: ${error.message}`)
  return data
}

export const saveMedicalSummaryInDB = async (userId: string, payload: any) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const row = {
    user_id: userUUID,
    title: payload.title || 'HealthTwin Clinical Synthesis',
    summary_text: payload.summaryText || payload.summary_text,
    telugu_summary: payload.teluguSummary || payload.telugu_summary || null,
    source_record_ids: payload.sourceRecordIds || payload.source_record_ids || [],
    summary_type: payload.summaryType || 'executive',
    model_provider: payload.modelProvider || 'healthtwin-grounded-rules',
    model_name: payload.modelName || 'healthtwin-clinical-synthesizer-v1',
    flagged_analytes: payload.flaggedAnalytes || [],
    system_observations: payload.systemObservations || [],
    doctor_checklist: payload.doctorChecklist || [],
    generated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('medical_summaries').insert(row).select().single()
  if (error) throw new DatabaseError(`Failed to save medical summary: ${error.message}`)
  return data
}

export const getReportExplanationsFromDB = async (recordId: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase
    .from('report_explanations')
    .select('*')
    .eq('medical_record_id', recordId)
    .eq('user_id', userUUID)
    .order('created_at', { ascending: false })

  if (error) throw new DatabaseError(`Failed to fetch report explanations: ${error.message}`)
  return data || []
}

export const createReportExplanationInDB = async (recordId: string, payload: any, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const row = {
    user_id: userUUID,
    medical_record_id: recordId,
    title: payload.title || 'Report Explanation',
    file_name: payload.fileName || payload.file_name || 'Medical_Report.pdf',
    explanation_text: payload.explanationText || payload.explanation_text || '',
    telugu_explanation: payload.teluguExplanation || payload.telugu_explanation || null,
    analytes: payload.analytes || [],
    terminology: payload.terminology || [],
    model_provider: payload.modelProvider || 'clinical_explainer',
    model_name: payload.modelName || 'healthtwin-explainer-v1',
  }

  const { data, error } = await supabase.from('report_explanations').insert(row).select().single()
  if (error) throw new DatabaseError(`Failed to save report explanation: ${error.message}`)
  return data
}

export const getHealthAlertsFromDB = async (userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  await ensureProfileExists(userUUID)

  const { data, error } = await supabase.from('health_alerts').select('*').eq('user_id', userUUID).order('created_at', { ascending: false })
  if (error) throw new DatabaseError(`Failed to fetch health alerts: ${error.message}`)
  return data || []
}

export const acknowledgeHealthAlertInDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const { data, error } = await supabase
    .from('health_alerts')
    .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userUUID)
    .select()
    .single()

  if (error) throw new DatabaseError(`Failed to acknowledge alert: ${error.message}`)
  return data
}

export const resolveHealthAlertInDB = async (id: string, userId: string) => {
  const supabase = ensureSupabase()
  const userUUID = resolveUserUUID(userId)
  const { data, error } = await supabase
    .from('health_alerts')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userUUID)
    .select()
    .single()

  if (error) throw new DatabaseError(`Failed to resolve alert: ${error.message}`)
  return data
}

