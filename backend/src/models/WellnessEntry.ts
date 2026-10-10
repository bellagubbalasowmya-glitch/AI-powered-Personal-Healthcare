export interface IHabitItem {
  id: string
  name: string
  category: 'mindfulness' | 'hydration' | 'activity' | 'nutrition' | 'sleep'
  completed: boolean
}

export interface IWellnessEntry {
  id: string
  userId: string
  date: string
  sleepHours: number
  sleepQuality: 'Restful' | 'Moderate' | 'Restless'
  waterGlasses: number
  waterTarget: number
  activeMinutes: number
  habits: IHabitItem[]
  moodNote?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}
