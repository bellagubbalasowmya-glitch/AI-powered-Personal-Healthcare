export interface IDoctorAppointment {
  id: string
  userId: string
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
  status: 'Confirmed (Local Demo)' | 'Rescheduled' | 'Completed' | 'Cancelled'
  isLocalDemo: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}
