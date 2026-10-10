export interface IMedicineReminder {
  id: string
  userId: string
  medicineName: string
  prescribedDosage: string
  scheduleTime: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime'
  timeString: string
  frequency: string
  startDate: string
  endDate?: string
  instructions: string
  status: 'Pending' | 'Taken' | 'Missed'
  lastTakenTimestamp?: string
  notes?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}
