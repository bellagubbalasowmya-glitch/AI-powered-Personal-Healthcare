import type {
  HeartRatePoint,
  DailyStepPoint,
  SleepDataPoint,
  ActivityPoint,
} from '../types/health'

export const SIMULATED_WEARABLE_NOTE =
  'Simulated Data — Not Connected to a Real Device. Values are synthetically generated for interface demonstration purposes.'

// 24-hour intraday heart rate points
export const MOCK_INTRADAY_HEART_RATE: HeartRatePoint[] = [
  { time: '00:00', bpm: 58, restingBpm: 60 },
  { time: '02:00', bpm: 54, restingBpm: 60 },
  { time: '04:00', bpm: 52, restingBpm: 60 },
  { time: '06:00', bpm: 61, restingBpm: 60 },
  { time: '07:30', bpm: 82, restingBpm: 60 }, // morning routine
  { time: '09:00', bpm: 74, restingBpm: 60 },
  { time: '11:00', bpm: 71, restingBpm: 60 },
  { time: '12:30', bpm: 78, restingBpm: 60 }, // lunch walk
  { time: '14:00', bpm: 69, restingBpm: 60 },
  { time: '16:00', bpm: 73, restingBpm: 60 },
  { time: '17:30', bpm: 124, restingBpm: 60 }, // workout
  { time: '18:15', bpm: 142, restingBpm: 60 }, // peak cardio
  { time: '19:00', bpm: 86, restingBpm: 60 }, // cool down
  { time: '21:00', bpm: 66, restingBpm: 60 },
  { time: '23:00', bpm: 60, restingBpm: 60 },
]

// 30-day simulated steps history
export const MOCK_STEPS_30_DAYS: DailyStepPoint[] = [
  { date: 'Sep 10', steps: 8420, goal: 8000, distanceKm: 6.2 },
  { date: 'Sep 11', steps: 9140, goal: 8000, distanceKm: 6.8 },
  { date: 'Sep 12', steps: 7890, goal: 8000, distanceKm: 5.9 },
  { date: 'Sep 13', steps: 8300, goal: 8000, distanceKm: 6.1 },
  { date: 'Sep 14', steps: 10450, goal: 8000, distanceKm: 7.9 },
  { date: 'Sep 15', steps: 11200, goal: 8000, distanceKm: 8.4 },
  { date: 'Sep 16', steps: 6800, goal: 8000, distanceKm: 5.1 },
  { date: 'Sep 17', steps: 8900, goal: 8000, distanceKm: 6.6 },
  { date: 'Sep 18', steps: 9340, goal: 8000, distanceKm: 7.0 },
  { date: 'Sep 19', steps: 8120, goal: 8000, distanceKm: 6.0 },
  { date: 'Sep 20', steps: 7600, goal: 8000, distanceKm: 5.7 },
  { date: 'Sep 21', steps: 10980, goal: 8000, distanceKm: 8.2 },
  { date: 'Sep 22', steps: 12400, goal: 8000, distanceKm: 9.3 },
  { date: 'Sep 23', steps: 7920, goal: 8000, distanceKm: 5.9 },
  { date: 'Sep 24', steps: 8650, goal: 8000, distanceKm: 6.4 },
  { date: 'Sep 25', steps: 9410, goal: 8000, distanceKm: 7.1 },
  { date: 'Sep 26', steps: 8230, goal: 8000, distanceKm: 6.2 },
  { date: 'Sep 27', steps: 7750, goal: 8000, distanceKm: 5.8 },
  { date: 'Sep 28', steps: 11300, goal: 8000, distanceKm: 8.5 },
  { date: 'Sep 29', steps: 10840, goal: 8000, distanceKm: 8.1 },
  { date: 'Sep 30', steps: 8600, goal: 8000, distanceKm: 6.4 },
  { date: 'Oct 01', steps: 9210, goal: 8000, distanceKm: 6.9 },
  { date: 'Oct 02', steps: 8780, goal: 8000, distanceKm: 6.5 },
  { date: 'Oct 03', steps: 8050, goal: 8000, distanceKm: 6.0 },
  { date: 'Oct 04', steps: 7420, goal: 8000, distanceKm: 5.5 },
  { date: 'Oct 05', steps: 10600, goal: 8000, distanceKm: 7.9 },
  { date: 'Oct 06', steps: 11950, goal: 8000, distanceKm: 8.9 },
  { date: 'Oct 07', steps: 8520, goal: 8000, distanceKm: 6.3 },
  { date: 'Oct 08', steps: 9110, goal: 8000, distanceKm: 6.8 },
  { date: 'Oct 09', steps: 8840, goal: 8000, distanceKm: 6.6 },
]

// 30-day simulated sleep composition
export const MOCK_SLEEP_30_DAYS: SleepDataPoint[] = [
  { date: 'Sep 10', deepHours: 1.8, remHours: 1.9, lightHours: 3.5, totalHours: 7.2, efficiency: 89 },
  { date: 'Sep 11', deepHours: 1.6, remHours: 1.8, lightHours: 4.1, totalHours: 7.5, efficiency: 91 },
  { date: 'Sep 12', deepHours: 1.4, remHours: 1.5, lightHours: 3.6, totalHours: 6.5, efficiency: 84 },
  { date: 'Sep 13', deepHours: 2.0, remHours: 2.1, lightHours: 3.9, totalHours: 8.0, efficiency: 94 },
  { date: 'Sep 14', deepHours: 1.9, remHours: 1.8, lightHours: 4.0, totalHours: 7.7, efficiency: 90 },
  { date: 'Sep 15', deepHours: 1.5, remHours: 1.6, lightHours: 3.8, totalHours: 6.9, efficiency: 86 },
  { date: 'Sep 16', deepHours: 1.7, remHours: 1.9, lightHours: 3.8, totalHours: 7.4, efficiency: 88 },
  { date: 'Sep 17', deepHours: 1.8, remHours: 2.0, lightHours: 3.6, totalHours: 7.4, efficiency: 90 },
  { date: 'Sep 18', deepHours: 1.5, remHours: 1.7, lightHours: 3.9, totalHours: 7.1, efficiency: 87 },
  { date: 'Sep 19', deepHours: 1.3, remHours: 1.4, lightHours: 3.5, totalHours: 6.2, efficiency: 81 },
  { date: 'Sep 20', deepHours: 2.1, remHours: 2.0, lightHours: 4.1, totalHours: 8.2, efficiency: 93 },
  { date: 'Sep 21', deepHours: 1.9, remHours: 1.9, lightHours: 3.9, totalHours: 7.7, efficiency: 91 },
  { date: 'Sep 22', deepHours: 1.7, remHours: 1.8, lightHours: 3.7, totalHours: 7.2, efficiency: 88 },
  { date: 'Sep 23', deepHours: 1.6, remHours: 1.6, lightHours: 3.6, totalHours: 6.8, efficiency: 85 },
  { date: 'Sep 24', deepHours: 1.8, remHours: 1.9, lightHours: 3.8, totalHours: 7.5, efficiency: 89 },
  { date: 'Sep 25', deepHours: 1.9, remHours: 2.0, lightHours: 3.9, totalHours: 7.8, efficiency: 92 },
  { date: 'Sep 26', deepHours: 1.5, remHours: 1.6, lightHours: 3.7, totalHours: 6.8, efficiency: 86 },
  { date: 'Sep 27', deepHours: 1.7, remHours: 1.8, lightHours: 3.6, totalHours: 7.1, efficiency: 88 },
  { date: 'Sep 28', deepHours: 2.2, remHours: 2.1, lightHours: 4.0, totalHours: 8.3, efficiency: 94 },
  { date: 'Sep 29', deepHours: 1.8, remHours: 1.9, lightHours: 3.9, totalHours: 7.6, efficiency: 90 },
  { date: 'Sep 30', deepHours: 1.6, remHours: 1.7, lightHours: 3.8, totalHours: 7.1, efficiency: 87 },
  { date: 'Oct 01', deepHours: 1.7, remHours: 1.8, lightHours: 3.7, totalHours: 7.2, efficiency: 89 },
  { date: 'Oct 02', deepHours: 1.9, remHours: 1.9, lightHours: 3.8, totalHours: 7.6, efficiency: 91 },
  { date: 'Oct 03', deepHours: 1.4, remHours: 1.5, lightHours: 3.6, totalHours: 6.5, efficiency: 82 },
  { date: 'Oct 04', deepHours: 1.8, remHours: 1.8, lightHours: 3.8, totalHours: 7.4, efficiency: 88 },
  { date: 'Oct 05', deepHours: 2.0, remHours: 2.2, lightHours: 4.1, totalHours: 8.3, efficiency: 95 },
  { date: 'Oct 06', deepHours: 1.9, remHours: 1.9, lightHours: 3.9, totalHours: 7.7, efficiency: 90 },
  { date: 'Oct 07', deepHours: 1.6, remHours: 1.7, lightHours: 3.8, totalHours: 7.1, efficiency: 87 },
  { date: 'Oct 08', deepHours: 1.8, remHours: 1.9, lightHours: 3.8, totalHours: 7.5, efficiency: 90 },
  { date: 'Oct 09', deepHours: 1.7, remHours: 1.8, lightHours: 3.7, totalHours: 7.2, efficiency: 89 },
]

// 30-day activity data
export const MOCK_ACTIVITY_30_DAYS: ActivityPoint[] = [
  { date: 'Sep 10', activeMinutes: 42, targetMinutes: 30, caloriesBurned: 420 },
  { date: 'Sep 11', activeMinutes: 48, targetMinutes: 30, caloriesBurned: 480 },
  { date: 'Sep 12', activeMinutes: 28, targetMinutes: 30, caloriesBurned: 290 },
  { date: 'Sep 13', activeMinutes: 45, targetMinutes: 30, caloriesBurned: 440 },
  { date: 'Sep 14', activeMinutes: 62, targetMinutes: 30, caloriesBurned: 610 },
  { date: 'Sep 15', activeMinutes: 70, targetMinutes: 30, caloriesBurned: 690 },
  { date: 'Sep 16', activeMinutes: 22, targetMinutes: 30, caloriesBurned: 240 },
  { date: 'Sep 17', activeMinutes: 46, targetMinutes: 30, caloriesBurned: 450 },
  { date: 'Sep 18', activeMinutes: 52, targetMinutes: 30, caloriesBurned: 510 },
  { date: 'Sep 19', activeMinutes: 38, targetMinutes: 30, caloriesBurned: 380 },
  { date: 'Sep 20', activeMinutes: 31, targetMinutes: 30, caloriesBurned: 320 },
  { date: 'Sep 21', activeMinutes: 65, targetMinutes: 30, caloriesBurned: 630 },
  { date: 'Sep 22', activeMinutes: 75, targetMinutes: 30, caloriesBurned: 720 },
  { date: 'Sep 23', activeMinutes: 35, targetMinutes: 30, caloriesBurned: 360 },
  { date: 'Sep 24', activeMinutes: 44, targetMinutes: 30, caloriesBurned: 430 },
  { date: 'Sep 25', activeMinutes: 50, targetMinutes: 30, caloriesBurned: 490 },
  { date: 'Sep 26', activeMinutes: 40, targetMinutes: 30, caloriesBurned: 410 },
  { date: 'Sep 27', activeMinutes: 33, targetMinutes: 30, caloriesBurned: 340 },
  { date: 'Sep 28', activeMinutes: 68, targetMinutes: 30, caloriesBurned: 660 },
  { date: 'Sep 29', activeMinutes: 64, targetMinutes: 30, caloriesBurned: 620 },
  { date: 'Sep 30', activeMinutes: 45, targetMinutes: 30, caloriesBurned: 440 },
  { date: 'Oct 01', activeMinutes: 48, targetMinutes: 30, caloriesBurned: 470 },
  { date: 'Oct 02', activeMinutes: 42, targetMinutes: 30, caloriesBurned: 420 },
  { date: 'Oct 03', activeMinutes: 36, targetMinutes: 30, caloriesBurned: 370 },
  { date: 'Oct 04', activeMinutes: 26, targetMinutes: 30, caloriesBurned: 280 },
  { date: 'Oct 05', activeMinutes: 63, targetMinutes: 30, caloriesBurned: 620 },
  { date: 'Oct 06', activeMinutes: 72, targetMinutes: 30, caloriesBurned: 710 },
  { date: 'Oct 07', activeMinutes: 41, targetMinutes: 30, caloriesBurned: 410 },
  { date: 'Oct 08', activeMinutes: 49, targetMinutes: 30, caloriesBurned: 480 },
  { date: 'Oct 09', activeMinutes: 46, targetMinutes: 30, caloriesBurned: 450 },
]

export const WELLNESS_SUMMARY_METRICS = {
  restingHeartRate: {
    value: 60,
    unit: 'bpm',
    status: 'Within expected baseline (60-72 bpm)',
    change: '-2 bpm vs last month',
  },
  dailyStepsAvg: {
    value: 9080,
    unit: 'steps/day',
    status: 'Exceeding 8,000 steps daily objective',
    change: '+6.2% vs prior week',
  },
  sleepDurationAvg: {
    value: 7.3,
    unit: 'hours/night',
    status: 'Optimal recovery consistency (89% efficiency)',
    change: '+18 mins vs 30-day baseline',
  },
  activeMinutesAvg: {
    value: 48,
    unit: 'mins/day',
    status: 'Surpassing 150 mins/week WHO aerobic benchmark',
    change: '+5 mins/day average',
  },
}

export const WELLNESS_TREND_EXPLANATION = {
  title: 'Illustrative Wellness Synthesis',
  subtitle: 'Simulated Pattern Observations — Educational & Non-Diagnostic',
  bulletPoints: [
    'Resting heart rate remains stable around 60 bpm with consistent nocturnal drops during deep sleep phases.',
    'Daily step volume demonstrates consistent weekend peaks (averaging >11,000 steps on Saturdays/Sundays) and steady weekday maintenance.',
    'Sleep duration averages 7.3 hours with a balanced distribution between restorative slow-wave deep sleep (1.7h avg) and REM cycles (1.8h avg).',
    'Active exercise blocks reflect moderate-to-vigorous cardiovascular intervals without prolonged post-exercise heart rate recovery anomalies.',
  ],
  disclaimer:
    'Simulated telemetry metrics are displayed strictly for interface evaluation. HealthTwin AI does not monitor real physiological hardware in this demo stage, does not diagnose cardiac or metabolic disorders, and does not provide clinical guidance.',
}
