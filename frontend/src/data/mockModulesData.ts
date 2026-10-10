import type {
  MedicineReminder,
  VitalMeasurement,
  ReportExplainerDocument,
  DoctorAppointment,
  EmergencyCardInfo,
  DailyWellnessEntry,
  UnknownConditionAlertItem,
} from '../types/health'

// ==========================================
// 1. SMART MEDICINE REMINDERS
// ==========================================
export const INITIAL_MEDICINE_REMINDERS: MedicineReminder[] = [
  {
    id: 'rem-01',
    medicineName: 'Atorvastatin Calcium',
    prescribedDosage: '10 mg oral tablet',
    scheduleTime: 'Bedtime',
    timeString: '10:00 PM',
    frequency: 'Once Daily',
    startDate: '2024-08-16',
    endDate: '2025-08-16',
    instructions: 'Take with a glass of water at night. Strictly per Dr. Michael Chen prescription.',
    status: 'Pending',
    notes: 'Prescribed for lipid profile management. Do not change dosage without doctor approval.',
  },
  {
    id: 'rem-02',
    medicineName: 'Cholecalciferol (Vitamin D3)',
    prescribedDosage: '2,000 IU softgel',
    scheduleTime: 'Morning',
    timeString: '08:30 AM',
    frequency: 'Once Daily with Food',
    startDate: '2024-08-16',
    instructions: 'Take during or immediately after breakfast with foods containing dietary healthy fats.',
    status: 'Taken',
    lastTakenTimestamp: 'Today, 08:35 AM',
    notes: 'Maintenance bone and metabolic wellness support.',
  },
  {
    id: 'rem-03',
    medicineName: 'Omega-3 EPA/DHA Fish Oil',
    prescribedDosage: '1,000 mg softgel',
    scheduleTime: 'Afternoon',
    timeString: '01:30 PM',
    frequency: 'Once Daily with Lunch',
    startDate: '2024-06-01',
    instructions: 'Swallow whole with food and water.',
    status: 'Taken',
    lastTakenTimestamp: 'Today, 01:25 PM',
    notes: 'Dietary supplement adjunct.',
  },
  {
    id: 'rem-04',
    medicineName: 'Pantoprazole Sodium (Sample PRN)',
    prescribedDosage: '40 mg delayed-release',
    scheduleTime: 'Morning',
    timeString: '07:30 AM',
    frequency: 'As Needed (30m before breakfast)',
    startDate: '2024-09-01',
    endDate: '2024-10-15',
    instructions: 'Take on an empty stomach with plain water at least 30 minutes before first meal.',
    status: 'Pending',
    notes: 'Temporary acid reflux protocol.',
  },
]

// ==========================================
// 2. HEALTH VITALS MONITORING
// ==========================================
export const INITIAL_VITALS_MEASUREMENTS: VitalMeasurement[] = [
  {
    id: 'vit-101',
    date: '2024-10-09',
    time: '08:15 AM',
    systolic: 120,
    diastolic: 78,
    pulse: 68,
    temperature: 98.4,
    temperatureUnit: '°F',
    oxygenSaturation: 99,
    notes: 'Morning resting baseline, seated position.',
    isCautious: false,
  },
  {
    id: 'vit-102',
    date: '2024-10-08',
    time: '07:45 PM',
    systolic: 124,
    diastolic: 82,
    pulse: 74,
    temperature: 98.6,
    temperatureUnit: '°F',
    oxygenSaturation: 98,
    notes: 'Evening check following workday.',
    isCautious: false,
  },
  {
    id: 'vit-103',
    date: '2024-10-07',
    time: '08:30 AM',
    systolic: 132,
    diastolic: 86,
    pulse: 82,
    temperature: 98.7,
    temperatureUnit: '°F',
    oxygenSaturation: 98,
    notes: 'Measured right after brisk walk up 3 flights of stairs.',
    cautiousAlert: 'Systolic 132 mmHg is mildly elevated above 120 mmHg resting benchmark. Temporary post-exertion rise is common; observe resting reading.',
    isCautious: true,
  },
  {
    id: 'vit-104',
    date: '2024-10-06',
    time: '09:00 AM',
    systolic: 118,
    diastolic: 76,
    pulse: 66,
    temperature: 98.2,
    temperatureUnit: '°F',
    oxygenSaturation: 99,
    notes: 'Sunday morning rested state.',
    isCautious: false,
  },
  {
    id: 'vit-105',
    date: '2024-10-05',
    time: '08:00 AM',
    systolic: 122,
    diastolic: 80,
    pulse: 70,
    temperature: 98.6,
    temperatureUnit: '°F',
    oxygenSaturation: 98,
    notes: 'Normal morning reading.',
    isCautious: false,
  },
  {
    id: 'vit-106',
    date: '2024-10-04',
    time: '06:30 PM',
    systolic: 126,
    diastolic: 81,
    pulse: 73,
    temperature: 98.5,
    temperatureUnit: '°F',
    oxygenSaturation: 98,
    notes: 'Pre-dinner measurement.',
    isCautious: false,
  },
  {
    id: 'vit-107',
    date: '2024-10-03',
    time: '08:00 AM',
    systolic: 119,
    diastolic: 77,
    pulse: 65,
    temperature: 98.3,
    temperatureUnit: '°F',
    oxygenSaturation: 99,
    notes: 'Optimal baseline reading.',
    isCautious: false,
  },
]

// ==========================================
// 3. AI REPORT EXPLAINER PRELOADED SAMPLE DOCS
// ==========================================
export const INITIAL_REPORT_EXPLAINER_DOCS: ReportExplainerDocument[] = [
  {
    id: 'rep-01',
    fileName: 'Apex_Comprehensive_Metabolic_Panel_Sep2024.pdf',
    fileSize: '1.4 MB',
    uploadDate: '2024-09-28',
    category: 'Biochemical / Renal / Liver Panel',
    extractionStatus: 'Complete (Demo)',
    isDemoSimulation: true,
    analytes: [
      {
        id: 'an-1',
        testName: 'Fasting Blood Glucose',
        value: 106,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'Outside Reference Range',
        category: 'Metabolic',
        interpretationNotes: 'Mild elevation compared to standard fasting threshold. Ask doctor about dietary timing or HbA1c testing.',
        teluguExplanation: 'ఉపవాస రక్త చక్కెర (గ్లూకోజ్) సాధారణ పరిమితి 70-99 కంటే కొద్దిగా ఎక్కువగా 106 mg/dL ఉంది. వైద్యునితో సంప్రదించండి.',
      },
      {
        id: 'an-2',
        testName: 'Serum Creatinine',
        value: 0.9,
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.1 mg/dL',
        status: 'Within Reference Range',
        category: 'Renal',
        interpretationNotes: 'Normal kidney filtration marker.',
        teluguExplanation: 'సీరం క్రియాటినిన్ సాధారణ పరిధిలో ఉంది, ఇది మూత్రపిండాల పనితీరు బాగున్నట్లు సూచిస్తుంది.',
      },
      {
        id: 'an-3',
        testName: 'eGFR (Estimated GFR)',
        value: 98,
        unit: 'mL/min/1.73m²',
        referenceRange: '> 60 mL/min/1.73m²',
        status: 'Within Reference Range',
        category: 'Renal',
        interpretationNotes: 'Reassuring estimated glomerular filtration efficiency.',
        teluguExplanation: 'కిడ్నీల ఫిల్ట్రేషన్ రేటు 98 గా చాలా చక్కగా ఉంది.',
      },
      {
        id: 'an-4',
        testName: 'ALT (Alanine Aminotransferase)',
        value: 28,
        unit: 'U/L',
        referenceRange: '7 - 35 U/L',
        status: 'Within Reference Range',
        category: 'Metabolic',
        interpretationNotes: 'Normal liver enzyme index.',
        teluguExplanation: 'కాలేయ ఎంజైమ్ (ALT) సాధారణ పరిధిలోనే ఉంది.',
      },
    ],
    plainEnglishSummary:
      'This synthetic metabolic report shows healthy kidney function (eGFR 98, Creatinine 0.9) and normal liver enzyme levels. Fasting blood sugar was slightly above the standard fasting target at 106 mg/dL.',
    teluguSummary:
      'ఈ సింథటిక్ మెటబాలిక్ నివేదిక ప్రకారం కిడ్నీలు మరియు కాలేయ పనితీరు సాధారణంగా ఉన్నాయి. పరగడుపున రక్త చక్కెర (106 mg/dL) సాధారణ పరిమితి కంటే స్వల్పంగా ఎక్కువ ఉంది.',
    terminology: [
      {
        term: 'Fasting Blood Glucose',
        english: 'Blood sugar level measured after not eating for at least 8 to 12 hours.',
        telugu: 'కనీసం 8-12 గంటలు ఆహారం తీసుకోకుండా పరీక్షించే రక్త చక్కెర స్థాయి.',
      },
      {
        term: 'eGFR',
        english: 'Estimated Glomerular Filtration Rate; shows how well your kidneys filter toxins.',
        telugu: 'మూత్రపిండాలు రక్తాన్ని ఎంత సమర్థవంతంగా శుద్ధి చేస్తున్నాయో తెలిపే సూచిక.',
      },
      {
        term: 'Serum Creatinine',
        english: 'A waste byproduct from muscle metabolism cleared by healthy kidneys.',
        telugu: 'కండరాల కదలిక వల్ల ఉత్పత్తయ్యే వ్యర్థ పదార్థం; కిడ్నీల ఆరోగ్యాన్ని తెలుపుతుంది.',
      },
    ],
  },
]

// ==========================================
// 4. DOCTOR APPOINTMENTS
// ==========================================
export const INITIAL_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: 'apt-01',
    doctorName: 'Dr. Michael Chen, MD',
    specialty: 'Cardiovascular Medicine',
    date: '2024-10-24',
    time: '10:30 AM',
    durationMinutes: 30,
    clinicHospital: 'Metro Health Cardiology Pavilion',
    location: 'Suite 420, 100 Medical Center Way',
    visitType: 'In-Person',
    reason: 'Lipid panel follow-up and Atorvastatin 10mg tolerance review.',
    preparationNotes: 'Bring updated blood pressure home log and current medication list.',
    status: 'Confirmed (Local Demo)',
    isLocalDemo: true,
  },
  {
    id: 'apt-02',
    doctorName: 'Dr. Sarah Jenkins, MD',
    specialty: 'Internal Medicine / Primary Care',
    date: '2024-11-12',
    time: '02:00 PM',
    durationMinutes: 45,
    clinicHospital: 'Apex Family Health Clinic',
    location: 'Building B, Room 112',
    visitType: 'In-Person',
    reason: 'Annual comprehensive preventive wellness checkup & fasting glucose discussion.',
    preparationNotes: 'Fasting required for 10 hours if fasting lab repeat is ordered on-site.',
    status: 'Confirmed (Local Demo)',
    isLocalDemo: true,
  },
  {
    id: 'apt-03',
    doctorName: 'Dr. David Ramirez, DO',
    specialty: 'Orthopedic Sports Medicine',
    date: '2024-06-25',
    time: '11:15 AM',
    durationMinutes: 30,
    clinicHospital: 'University Sports Medicine Institute',
    location: 'Room 304',
    visitType: 'In-Person',
    reason: '6-week physical therapy follow-up for right patellofemoral knee strain.',
    preparationNotes: 'Patient completed assigned hamstring and quadriceps strengthening protocols.',
    status: 'Completed',
    isLocalDemo: true,
  },
]

// ==========================================
// 5. EMERGENCY HEALTH CARD
// ==========================================
export const INITIAL_EMERGENCY_CARD: EmergencyCardInfo = {
  patientName: 'Alex Morgan',
  patientId: 'SYN-PT-89420',
  age: 38,
  gender: 'Female',
  bloodGroup: 'B+ (Rh Positive)',
  allergies: [
    'PENICILLIN (Moderate: diffuse urticaria & erythematous rash in 2019)',
    'SULFA DRUGS (Self-reported mild gastrointestinal discomfort)',
  ],
  chronicConditions: [
    'Mild Dyslipidemia (Managed with lifestyle & low-dose Statin)',
    'History of Exercise-Induced Patellofemoral Discomfort (Resolved)',
  ],
  criticalMedications: [
    'Atorvastatin Calcium 10 mg (Daily at Bedtime)',
    'Cholecalciferol (Vitamin D3) 2,000 IU (Daily with Food)',
  ],
  emergencyContacts: [
    {
      id: 'ec-1',
      name: 'Jordan Morgan',
      relationship: 'Spouse',
      phone: '+1 (555) 019-2834 (Synthetic)',
      isPrimary: true,
    },
    {
      id: 'ec-2',
      name: 'Dr. Evelyn Morgan',
      relationship: 'Sister / Physician',
      phone: '+1 (555) 014-9921 (Synthetic)',
      isPrimary: false,
    },
  ],
  primaryPhysician: {
    name: 'Dr. Sarah Jenkins, MD',
    clinic: 'Apex Family Health Clinic',
    phone: '+1 (555) 018-7744',
  },
  preferredHospital: 'St. Jude Community Hospital Emergency Center',
  organDonor: true,
  medicalNotes:
    'Patient has no known cardiac implants or pacemakers. No history of seizures or hypoglycemic episodes.',
  lastUpdated: 'October 2024 (Demo Sync)',
}

// ==========================================
// 6. PERSONALIZED WELLNESS TRACKER
// ==========================================
export const INITIAL_WELLNESS_LOGS: DailyWellnessEntry[] = [
  {
    id: 'wlog-01',
    date: '2024-10-09',
    sleepHours: 7.4,
    sleepQuality: 'Restful',
    waterGlasses: 8,
    waterTarget: 8,
    activeMinutes: 45,
    habits: [
      { id: 'h1', name: '30-minute Cardiovascular Walk', category: 'activity', completed: true },
      { id: 'h2', name: 'Drank 8 Glasses of Water', category: 'hydration', completed: true },
      { id: 'h3', name: '10-minute Mindful Breathing', category: 'mindfulness', completed: true },
      { id: 'h4', name: 'Took Evening Medication', category: 'nutrition', completed: false },
      { id: 'h5', name: 'Screen-Free 30m Before Bed', category: 'sleep', completed: false },
    ],
    moodNote: 'Felt well-energized throughout morning meetings.',
  },
  {
    id: 'wlog-02',
    date: '2024-10-08',
    sleepHours: 7.1,
    sleepQuality: 'Restful',
    waterGlasses: 7,
    waterTarget: 8,
    activeMinutes: 50,
    habits: [
      { id: 'h1', name: '30-minute Cardiovascular Walk', category: 'activity', completed: true },
      { id: 'h2', name: 'Drank 8 Glasses of Water', category: 'hydration', completed: false },
      { id: 'h3', name: '10-minute Mindful Breathing', category: 'mindfulness', completed: true },
      { id: 'h4', name: 'Took Evening Medication', category: 'nutrition', completed: true },
      { id: 'h5', name: 'Screen-Free 30m Before Bed', category: 'sleep', completed: true },
    ],
  },
  {
    id: 'wlog-03',
    date: '2024-10-07',
    sleepHours: 6.5,
    sleepQuality: 'Moderate',
    waterGlasses: 6,
    waterTarget: 8,
    activeMinutes: 30,
    habits: [
      { id: 'h1', name: '30-minute Cardiovascular Walk', category: 'activity', completed: true },
      { id: 'h2', name: 'Drank 8 Glasses of Water', category: 'hydration', completed: false },
      { id: 'h3', name: '10-minute Mindful Breathing', category: 'mindfulness', completed: false },
      { id: 'h4', name: 'Took Evening Medication', category: 'nutrition', completed: true },
      { id: 'h5', name: 'Screen-Free 30m Before Bed', category: 'sleep', completed: false },
    ],
  },
  {
    id: 'wlog-04',
    date: '2024-10-06',
    sleepHours: 8.2,
    sleepQuality: 'Restful',
    waterGlasses: 9,
    waterTarget: 8,
    activeMinutes: 65,
    habits: [
      { id: 'h1', name: '30-minute Cardiovascular Walk', category: 'activity', completed: true },
      { id: 'h2', name: 'Drank 8 Glasses of Water', category: 'hydration', completed: true },
      { id: 'h3', name: '10-minute Mindful Breathing', category: 'mindfulness', completed: true },
      { id: 'h4', name: 'Took Evening Medication', category: 'nutrition', completed: true },
      { id: 'h5', name: 'Screen-Free 30m Before Bed', category: 'sleep', completed: true },
    ],
  },
]

// ==========================================
// 7. AI UNKNOWN-CONDITION ALERT
// ==========================================
export const INITIAL_UNKNOWN_CONDITION_ALERTS: UnknownConditionAlertItem[] = [
  {
    id: 'alert-01',
    sourceDocument: 'Comprehensive Metabolic Panel (Sep 28, 2024)',
    testOrFinding: 'Fasting Blood Glucose (106 mg/dL)',
    detectionDate: '2024-09-29',
    status: 'Needs review',
    confidenceLabel: 'Missing Baseline',
    uncertaintyReason:
      'Laboratory report does not contain verified documentation of patient fasting hours prior to phlebotomy. A non-fasting or partially fasting state alters glycemic reference interpretation.',
    missingParameters: [
      'Exact duration of pre-test fasting (e.g. 8h vs 12h)',
      'Concurrent HbA1c test for 3-month glycemic continuity',
    ],
    clinicianDiscussionRecommendation:
      'Confirm with ordering physician whether this blood draw was strictly fasting. Ask if an HbA1c test is indicated.',
    hasBeenReviewed: false,
  },
  {
    id: 'alert-02',
    sourceDocument: 'Cardiovascular Risk Screen (Aug 15, 2024)',
    testOrFinding: 'Calculated Non-HDL vs Direct LDL Assay',
    detectionDate: '2024-08-16',
    status: 'Incomplete information',
    confidenceLabel: 'Ambiguous Data',
    uncertaintyReason:
      'LDL cholesterol value (128 mg/dL) was calculated using standard Friedewald formula rather than direct homogeneous assay, but measured triglycerides approached 150 mg/dL threshold.',
    missingParameters: [
      'Direct LDL-C biochemical measurement',
      'Apolipoprotein B (ApoB) or Lipoprotein(a) risk markers',
    ],
    clinicianDiscussionRecommendation:
      'Discuss whether advanced lipid fractionation or ApoB assessment is warranted for individualized cardiovascular stratification.',
    hasBeenReviewed: false,
  },
  {
    id: 'alert-03',
    sourceDocument: 'Sample Digital Chest X-Ray (Mar 02, 2024)',
    testOrFinding: 'Right Costophrenic Angle & Retrocardiac Region',
    detectionDate: '2024-03-03',
    status: 'Unable to interpret reliably',
    confidenceLabel: 'Low Confidence',
    uncertaintyReason:
      'Sub-optimal inspiration depth detected on PA view (8 posterior ribs visible vs standard 9-10). AI OCR engine cannot rule out bibasilar crowding or mild atelectatic density without clinical correlation.',
    missingParameters: [
      'Full lateral inspiration confirmation',
      'Clinical auscultation findings from referring doctor',
    ],
    clinicianDiscussionRecommendation:
      'Rely solely on attending radiologist written sign-off (Dr. Elena Rostova, MD). Do not infer pulmonary density from automated vision parsing alone.',
    hasBeenReviewed: true,
  },
]
