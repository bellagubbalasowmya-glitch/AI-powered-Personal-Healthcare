export interface IUser {
  id: string
  name: string
  email: string
  patientId: string
  age: number
  gender: string
  role: 'patient' | 'clinician' | 'admin'
  createdAt?: string | Date
  updatedAt?: string | Date
}
