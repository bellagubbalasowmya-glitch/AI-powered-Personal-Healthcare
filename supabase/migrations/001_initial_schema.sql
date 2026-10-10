-- ==============================================================================
-- HealthTwin AI — Personal Digital Twin, AI Health Copilot & Complete Schema
-- Migration 001: Initial PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- Updated At Trigger Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- Table 1: profiles
-- Store each user's basic profile, demographic baseline, and health preferences
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id TEXT UNIQUE DEFAULT 'SYN-PT-89420',
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  preferred_name TEXT,
  blood_group TEXT,
  height_cm NUMERIC CHECK (height_cm IS NULL OR height_cm BETWEEN 30 AND 300),
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'clinician', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_patient_id ON public.profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 2: medical_records
-- Store medical documents and their metadata (Blood test, Prescription, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  record_type TEXT NOT NULL,
  description TEXT,
  document_date DATE NOT NULL,
  provider_name TEXT,
  facility_name TEXT,
  storage_path TEXT,
  original_filename TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  processing_status TEXT DEFAULT 'processed',
  extracted_text TEXT,
  is_synthetic BOOLEAN DEFAULT true,
  extracted_fields JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  key_findings JSONB DEFAULT '[]'::jsonb,
  clinician_discussion_questions JSONB DEFAULT '[]'::jsonb,
  terminology_glossary JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON public.medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON public.medical_records(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON public.medical_records(record_type);

DROP TRIGGER IF EXISTS trg_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER trg_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 3: health_metrics
-- Measurable health observations over time (Blood pressure, glucose, vitals, SpO2)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value_numeric NUMERIC,
  value_text TEXT,
  unit TEXT,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'manual',
  notes TEXT,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  systolic INTEGER CHECK (systolic IS NULL OR systolic BETWEEN 40 AND 250),
  diastolic INTEGER CHECK (diastolic IS NULL OR diastolic BETWEEN 30 AND 160),
  pulse INTEGER CHECK (pulse IS NULL OR pulse BETWEEN 30 AND 240),
  temperature NUMERIC(5, 2) CHECK (temperature IS NULL OR temperature BETWEEN 80 AND 115),
  temperature_unit TEXT DEFAULT '°F',
  oxygen_saturation INTEGER CHECK (oxygen_saturation IS NULL OR oxygen_saturation BETWEEN 50 AND 100),
  is_cautious BOOLEAN DEFAULT false,
  cautious_alert TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON public.health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_measured_at ON public.health_metrics(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON public.health_metrics(metric_type);

-- ==============================================================================
-- Table 4: medications
-- Maintain a user's active and historical medication list
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route TEXT DEFAULT 'Oral',
  frequency TEXT DEFAULT 'Daily',
  instructions TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  source_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(is_active);

DROP TRIGGER IF EXISTS trg_medications_updated_at ON public.medications;
CREATE TRIGGER trg_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 5: appointments
-- Store doctor consultations, clinic visits, and telehealth sessions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  appointment_datetime TIMESTAMPTZ NOT NULL,
  appointment_type TEXT DEFAULT 'In-Person',
  location TEXT DEFAULT '',
  reason TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
  reminder_enabled BOOLEAN DEFAULT TRUE,
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON public.appointments(appointment_datetime ASC);

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 6: reminders
-- User-created and prescribed reminders for medications, visits, and checks
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('Medication', 'Appointment', 'Health check', 'Hydration', 'Custom')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  repeat_rule TEXT DEFAULT 'Daily',
  related_medication_id UUID REFERENCES public.medications(id) ON DELETE SET NULL,
  related_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notification_channel TEXT DEFAULT 'in_app',
  schedule_time TEXT DEFAULT 'Morning',
  time_string TEXT DEFAULT '08:00 AM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON public.reminders(scheduled_at ASC);

DROP TRIGGER IF EXISTS trg_reminders_updated_at ON public.reminders;
CREATE TRIGGER trg_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 7: medical_summaries
-- Generated summaries of user-provided medical information
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'HealthTwin Clinical Synthesis',
  summary_text TEXT NOT NULL,
  telugu_summary TEXT,
  source_record_ids UUID[] DEFAULT '{}',
  summary_type TEXT DEFAULT 'executive',
  model_provider TEXT DEFAULT 'clinical_guardrails',
  model_name TEXT DEFAULT 'healthtwin-synthesizer-v1',
  prompt_version TEXT DEFAULT '1.0',
  flagged_analytes JSONB DEFAULT '[]'::jsonb,
  system_observations JSONB DEFAULT '[]'::jsonb,
  doctor_checklist JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_summaries_user_id ON public.medical_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_summaries_generated ON public.medical_summaries(generated_at DESC);

-- ==============================================================================
-- Table 8: copilot_conversations
-- Conversation sessions for the Health Copilot
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.copilot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Health Copilot Consultation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_user ON public.copilot_conversations(user_id);

DROP TRIGGER IF EXISTS trg_copilot_conversations_updated_at ON public.copilot_conversations;
CREATE TRIGGER trg_copilot_conversations_updated_at
  BEFORE UPDATE ON public.copilot_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 9: copilot_messages
-- Individual messages belonging to copilot conversations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.copilot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.copilot_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  referenced_record_ids UUID[] DEFAULT '{}',
  citations TEXT[] DEFAULT '{}',
  suggested_follow_ups TEXT[] DEFAULT '{}',
  is_clinically_bounded BOOLEAN DEFAULT true,
  model_provider TEXT DEFAULT 'healthtwin-guardrail',
  model_name TEXT DEFAULT 'healthtwin-copilot-v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_conversation ON public.copilot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_user ON public.copilot_messages(user_id);

-- ==============================================================================
-- Table 10: wellness_entries
-- Daily wellness, hydration, sleep architecture, and habit tracking
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wellness_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  sleep_hours NUMERIC CHECK (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24),
  activity_minutes INTEGER CHECK (activity_minutes IS NULL OR activity_minutes BETWEEN 0 AND 1440),
  steps INTEGER CHECK (steps IS NULL OR steps >= 0),
  water_intake_ml INTEGER CHECK (water_intake_ml IS NULL OR water_intake_ml >= 0),
  water_glasses INTEGER DEFAULT 0,
  water_target INTEGER DEFAULT 8,
  sleep_quality TEXT DEFAULT 'Restful' CHECK (sleep_quality IN ('Restful', 'Moderate', 'Restless')),
  mood TEXT,
  energy_level INTEGER CHECK (energy_level IS NULL OR energy_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level IS NULL OR stress_level BETWEEN 1 AND 10),
  notes TEXT,
  source TEXT DEFAULT 'manual',
  habits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wellness_entries_user ON public.wellness_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_date ON public.wellness_entries(entry_date DESC);

DROP TRIGGER IF EXISTS trg_wellness_entries_updated_at ON public.wellness_entries;
CREATE TRIGGER trg_wellness_entries_updated_at
  BEFORE UPDATE ON public.wellness_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 11: health_alerts
-- Boundary detection alerts flagging ambiguous data and missing clinical baseline
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  health_metric_id UUID REFERENCES public.health_metrics(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'urgent', 'caution', 'info', 'Needs review', 'Incomplete information', 'Unable to interpret reliably')),
  rule_id TEXT,
  rule_version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  missing_parameters TEXT[] DEFAULT '{}',
  clinician_recommendation TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_alerts_user ON public.health_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON public.health_alerts(status);

-- ==============================================================================
-- Table 12: report_explanations
-- Plain-language explanations generated from medical reports
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.report_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT,
  explanation_text TEXT NOT NULL,
  telugu_explanation TEXT,
  analytes JSONB DEFAULT '[]'::jsonb,
  terminology JSONB DEFAULT '[]'::jsonb,
  model_provider TEXT DEFAULT 'clinical_explainer',
  model_name TEXT DEFAULT 'healthtwin-explainer-v1',
  extraction_status TEXT DEFAULT 'Complete (Demo)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_explanations_user ON public.report_explanations(user_id);
CREATE INDEX IF NOT EXISTS idx_report_explanations_record ON public.report_explanations(medical_record_id);

-- ==============================================================================
-- Table 13: emergency_cards
-- Critical allergy, blood type, emergency contact, physician & donor status
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  allergies JSONB DEFAULT '[]'::jsonb,
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  critical_medications JSONB DEFAULT '[]'::jsonb,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  primary_physician JSONB DEFAULT '{}'::jsonb,
  preferred_hospital TEXT DEFAULT '',
  organ_donor BOOLEAN DEFAULT FALSE,
  medical_notes TEXT DEFAULT '',
  last_updated TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_cards_user ON public.emergency_cards(user_id);

DROP TRIGGER IF EXISTS trg_emergency_cards_updated_at ON public.emergency_cards;
CREATE TRIGGER trg_emergency_cards_updated_at
  BEFORE UPDATE ON public.emergency_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- Table 14: user_consents
-- Consent records for optional processing, sharing, and connected services
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  is_granted BOOLEAN DEFAULT TRUE,
  version TEXT DEFAULT '1.0',
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON public.user_consents(user_id);

-- ==============================================================================
-- Table 15: audit_logs
-- Security-relevant events (sign-in, record access, deletion) without PHI body
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- Enforce patient-level isolation: each patient can only access their own records
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to retrieve profile ID matching auth.uid()
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR id = auth.uid());

-- 2. Medical Records Policies
DROP POLICY IF EXISTS "records_own" ON public.medical_records;
CREATE POLICY "records_own" ON public.medical_records
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 3. Health Metrics Policies
DROP POLICY IF EXISTS "metrics_own" ON public.health_metrics;
CREATE POLICY "metrics_own" ON public.health_metrics
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 4. Medications Policies
DROP POLICY IF EXISTS "medications_own" ON public.medications;
CREATE POLICY "medications_own" ON public.medications
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 5. Appointments Policies
DROP POLICY IF EXISTS "appointments_own" ON public.appointments;
CREATE POLICY "appointments_own" ON public.appointments
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 6. Reminders Policies
DROP POLICY IF EXISTS "reminders_own" ON public.reminders;
CREATE POLICY "reminders_own" ON public.reminders
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 7. Medical Summaries Policies
DROP POLICY IF EXISTS "summaries_own" ON public.medical_summaries;
CREATE POLICY "summaries_own" ON public.medical_summaries
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 8. Copilot Conversations & Messages Policies
DROP POLICY IF EXISTS "copilot_conv_own" ON public.copilot_conversations;
CREATE POLICY "copilot_conv_own" ON public.copilot_conversations
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "copilot_msg_own" ON public.copilot_messages;
CREATE POLICY "copilot_msg_own" ON public.copilot_messages
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 9. Wellness Entries Policies
DROP POLICY IF EXISTS "wellness_own" ON public.wellness_entries;
CREATE POLICY "wellness_own" ON public.wellness_entries
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 10. Health Alerts Policies
DROP POLICY IF EXISTS "alerts_own" ON public.health_alerts;
CREATE POLICY "alerts_own" ON public.health_alerts
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 11. Report Explanations Policies
DROP POLICY IF EXISTS "explanations_own" ON public.report_explanations;
CREATE POLICY "explanations_own" ON public.report_explanations
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 12. Emergency Cards Policies
DROP POLICY IF EXISTS "emergency_own" ON public.emergency_cards;
CREATE POLICY "emergency_own" ON public.emergency_cards
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 13. User Consents Policies
DROP POLICY IF EXISTS "consents_own" ON public.user_consents;
CREATE POLICY "consents_own" ON public.user_consents
  FOR ALL TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());

-- 14. Audit Logs Policies (User can read own audit events)
DROP POLICY IF EXISTS "audit_logs_own_read" ON public.audit_logs;
CREATE POLICY "audit_logs_own_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (user_id = public.current_profile_id());

-- ==============================================================================
-- Private Supabase Storage Bucket Configuration
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Ensure patients can only read and upload their own folder
DROP POLICY IF EXISTS "storage_patient_own_files_select" ON storage.objects;
CREATE POLICY "storage_patient_own_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "storage_patient_own_files_insert" ON storage.objects;
CREATE POLICY "storage_patient_own_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==============================================================================
-- Initial Demo Patient Baseline (Alex Morgan - Synthetic Demo Profile)
-- Deterministic UUID: d3b07384-d113-469a-a8fe-89241951f38e
-- ==============================================================================
INSERT INTO public.profiles (
  id,
  patient_id,
  full_name,
  date_of_birth,
  preferred_name,
  blood_group,
  height_cm,
  preferred_language,
  timezone,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  role
) VALUES (
  'd3b07384-d113-469a-a8fe-89241951f38e',
  'SYN-PT-89420',
  'Alex Morgan',
  '1988-06-14',
  'Alex',
  'O+',
  168,
  'en',
  'America/New_York',
  'Morgan Reed',
  '+1 (555) 019-2831',
  'Spouse',
  'patient'
) ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  full_name = EXCLUDED.full_name,
  blood_group = EXCLUDED.blood_group,
  height_cm = EXCLUDED.height_cm;
