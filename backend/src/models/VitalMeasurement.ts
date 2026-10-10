export interface IVitalMeasurement {
  id: string
  userId: string
  date: string
  time: string
  systolic: number
  diastolic: number
  pulse: number
  temperature: number
  temperatureUnit: '°F' | '°C'
  oxygenSaturation: number
  notes?: string
  cautiousAlert?: string
  isCautious: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}
