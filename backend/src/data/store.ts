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

// In-memory reference store for initial seeds and testing
class MemoryStore {
  users = [DEMO_USER]
  records = JSON.parse(JSON.stringify(INITIAL_SEED_RECORDS))
  timeline = JSON.parse(JSON.stringify(INITIAL_SEED_TIMELINE))
  reminders = JSON.parse(JSON.stringify(INITIAL_SEED_REMINDERS))
  vitals = JSON.parse(JSON.stringify(INITIAL_SEED_VITALS))
  appointments = JSON.parse(JSON.stringify(INITIAL_SEED_APPOINTMENTS))
  emergencyCard = JSON.parse(JSON.stringify(INITIAL_SEED_EMERGENCY_CARD))
  wellness = JSON.parse(JSON.stringify(INITIAL_SEED_WELLNESS))
  explainer = JSON.parse(JSON.stringify(INITIAL_SEED_EXPLAINER))
  alerts = JSON.parse(JSON.stringify(INITIAL_SEED_ALERTS))
  chatHistory: Array<{ id: string; sender: 'user' | 'assistant'; content: string; timestamp: string }> = []

  reset() {
    this.users = [DEMO_USER]
    this.records = JSON.parse(JSON.stringify(INITIAL_SEED_RECORDS))
    this.timeline = JSON.parse(JSON.stringify(INITIAL_SEED_TIMELINE))
    this.reminders = JSON.parse(JSON.stringify(INITIAL_SEED_REMINDERS))
    this.vitals = JSON.parse(JSON.stringify(INITIAL_SEED_VITALS))
    this.appointments = JSON.parse(JSON.stringify(INITIAL_SEED_APPOINTMENTS))
    this.emergencyCard = JSON.parse(JSON.stringify(INITIAL_SEED_EMERGENCY_CARD))
    this.wellness = JSON.parse(JSON.stringify(INITIAL_SEED_WELLNESS))
    this.explainer = JSON.parse(JSON.stringify(INITIAL_SEED_EXPLAINER))
    this.alerts = JSON.parse(JSON.stringify(INITIAL_SEED_ALERTS))
  }
}

export const memoryStore = new MemoryStore()
