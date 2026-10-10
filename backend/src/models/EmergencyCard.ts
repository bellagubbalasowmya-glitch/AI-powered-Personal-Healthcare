export interface IEmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  isPrimary: boolean
}

export interface IEmergencyCard {
  id?: string
  userId: string
  patientName: string
  patientId: string
  age: number
  gender: string
  bloodGroup: string
  allergies: string[]
  chronicConditions: string[]
  criticalMedications: string[]
  emergencyContacts: IEmergencyContact[]
  primaryPhysician: {
    name: string
    clinic: string
    phone: string
  }
  preferredHospital: string
  organDonor: boolean
  medicalNotes: string
  lastUpdated: string
  createdAt?: string | Date
  updatedAt?: string | Date
}
