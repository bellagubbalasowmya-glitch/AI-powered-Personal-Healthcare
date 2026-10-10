# HealthTwin AI — Express & Supabase PostgreSQL Backend Service

Backend REST API service for **HealthTwin AI – Personal Digital Twin & Copilot**, supporting all 13 healthcare modules with Supabase PostgreSQL and Row Level Security (RLS).

---

## 1. Technology Stack
* **Runtime:** Node.js (v24+)
* **Framework:** Express.js (v4.21+)
* **Database:** Supabase PostgreSQL with Row Level Security (RLS)
* **SDK:** `@supabase/supabase-js` (v2.117+)
* **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`
* **File Uploads:** `multer` (restricted to PDF, PNG, JPG; max 10MB)
* **Language:** TypeScript (NodeNext / ES Modules) executed with `tsx`

---

## 2. Environment Variables (`backend/.env`)

```ini
PORT=5000
NODE_ENV=development

# Supabase PostgreSQL Configuration
# Obtain from https://supabase.com/dashboard -> Project -> Settings -> API
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key_here

# JWT Authentication Secret
JWT_SECRET=healthtwin_super_secret_jwt_key_2026_dev
JWT_EXPIRES_IN=7d

# Allowed Frontend Origins (Comma-separated)
CORS_ORIGIN=http://localhost:5173

# Auto-seed synthetic patient demo dataset on startup
ENABLE_DEMO_SEED=true
```

---

## 3. Database Schema Migration

Execute `supabase/migrations/001_initial_schema.sql` in the **Supabase SQL Editor**:
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** -> **New Query**
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

This creates all 11 health tables:
1. `profiles`
2. `medical_records`
3. `timeline_events`
4. `medicine_reminders`
5. `vital_measurements`
6. `doctor_appointments`
7. `wellness_entries`
8. `emergency_cards`
9. `report_explainers`
10. `report_analytes`
11. `unknown_condition_alerts`

---

## 4. Verification & Testing

Verify the Supabase PostgreSQL connection and test CRUD persistence with synthetic test data:
```cmd
npm run verify-db
```

---

## 5. API Endpoints

### System & Health
* `GET /api/health` — Service status, Supabase connection state, active modules list.

### Authentication & Authorization
* `POST /api/auth/login` — Login with email and password, returns JWT token.
* `POST /api/auth/register` — Register a new patient account with generated patient ID.
* `GET /api/auth/me` — Retrieve active authenticated user profile.

### Medical Records
* `GET /api/records` — List all medical records for the authenticated user.
* `GET /api/records/:id` — Retrieve record by ID.
* `POST /api/records` — Create a new clinical record (automatically generates linked timeline event).
* `PUT /api/records/:id` — Update record metadata and lab fields.
* `DELETE /api/records/:id` — Delete record and associated timeline events.

### AI Health Summary
* `GET /api/summary` — Synthesize longitudinal clinical summary, out-of-range lab highlights, system observations, and discussion questions for the doctor.

### Health Timeline
* `GET /api/timeline` — Retrieve chronological events and milestones.
* `POST /api/timeline` — Log a custom timeline event.

### Smart Medicine Reminders
* `GET /api/reminders` — List medication reminders.
* `POST /api/reminders` — Create prescribed reminder.
* `PUT /api/reminders/:id` — Update reminder or mark as taken.
* `DELETE /api/reminders/:id` — Delete reminder.

### Health Vitals Monitoring
* `GET /api/vitals` — List logged vitals.
* `POST /api/vitals` — Record blood pressure, pulse, temp, SpO2.
* `DELETE /api/vitals/:id` — Remove vital entry.

### Doctor Appointment Manager
* `GET /api/appointments` — List appointments (supports `?filter=upcoming|past`).
* `POST /api/appointments` — Schedule appointment.
* `PUT /api/appointments/:id` — Update status or reschedule.
* `DELETE /api/appointments/:id` — Cancel appointment.

### Personalized Wellness Tracker
* `GET /api/wellness` — Retrieve daily logs.
* `POST /api/wellness` — Record daily sleep, hydration, activity, and habits.
* `PUT /api/wellness/:id` — Update entry.
* `DELETE /api/wellness/:id` — Remove entry.

### Emergency Health Card
* `GET /api/emergency` — Retrieve emergency health profile.
* `PUT /api/emergency` — Update allergies, emergency contacts, primary physician.

### AI Medical Report Explainer
* `GET /api/explainer` — List parsed clinical documents.
* `POST /api/explainer/upload` — Upload and simulate document parsing.
* `PATCH /api/explainer/:docId/analyte/:analyteId` — Correct analyte values.

### Unknown Condition Alert & Uncertainty
* `GET /api/unknown-alerts` — List boundary detection alerts.
* `PATCH /api/unknown-alerts/:id/reviewed` — Toggle reviewed status.
* `POST /api/unknown-alerts/test` — Simulate clinical uncertainty.

### Ask Health Copilot
* `POST /api/copilot/query` — Ask plain-language questions bounded by uploaded records.
