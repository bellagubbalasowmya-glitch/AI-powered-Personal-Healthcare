import type { MedicalRecord, TimelineEvent } from '../types/health'

export const DEMO_USER_PROFILE = {
  name: 'Alex Morgan',
  patientId: 'SYN-PT-89420',
  age: 38,
  gender: 'Female',
  bloodType: 'B+',
  allergies: 'Penicillin (Documented mild rash in 2019)',
  chronicConditions: ['Mild Dyslipidemia (Monitored)'],
  emergencyContact: {
    name: 'Jordan Morgan',
    relationship: 'Spouse',
    phone: '+1 (555) 019-2834 (Synthetic)',
  },
}

export const INITIAL_MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-001',
    name: 'Comprehensive Metabolic Panel (CMP)',
    category: 'Laboratory Report',
    recordDate: '2024-09-28',
    facility: 'Apex Diagnostics & Clinical Lab',
    clinician: 'Dr. Sarah Jenkins, MD',
    fileSize: '1.4 MB',
    fileType: 'PDF',
    processingStatus: 'Processed (Demo)',
    isSynthetic: true,
    summary:
      'Synthetic routine metabolic panel showing normal renal and electrolyte parameters. Fasting serum glucose is slightly elevated above the standard fasting cutoff.',
    extractedFields: [
      {
        id: 'ef-101',
        testName: 'Fasting Blood Glucose',
        value: 106,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'Outside Reference Range',
        category: 'Metabolic',
        interpretationNotes:
          'Fasting reading slightly exceeds standard 99 mg/dL upper threshold. Consider discussing lifestyle or follow-up HbA1c check with your doctor.',
      },
      {
        id: 'ef-102',
        testName: 'Serum Creatinine',
        value: 0.9,
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.1 mg/dL',
        status: 'Within Reference Range',
        category: 'Renal',
        interpretationNotes: 'Normal renal clearance indicator.',
      },
      {
        id: 'ef-103',
        testName: 'eGFR (Estimated GFR)',
        value: 98,
        unit: 'mL/min/1.73m²',
        referenceRange: '> 60 mL/min/1.73m²',
        status: 'Within Reference Range',
        category: 'Renal',
        interpretationNotes: 'Normal estimated kidney filtration rate.',
      },
      {
        id: 'ef-104',
        testName: 'Sodium (Na)',
        value: 141,
        unit: 'mmol/L',
        referenceRange: '135 - 145 mmol/L',
        status: 'Within Reference Range',
        category: 'Electrolytes',
      },
      {
        id: 'ef-105',
        testName: 'Potassium (K)',
        value: 4.2,
        unit: 'mmol/L',
        referenceRange: '3.5 - 5.1 mmol/L',
        status: 'Within Reference Range',
        category: 'Electrolytes',
      },
      {
        id: 'ef-106',
        testName: 'ALT (Alanine Aminotransferase)',
        value: 28,
        unit: 'U/L',
        referenceRange: '7 - 35 U/L',
        status: 'Within Reference Range',
        category: 'Metabolic',
      },
    ],
    keyFindings: [
      'Renal filtration parameters (eGFR: 98 mL/min/1.73m², Creatinine: 0.9 mg/dL) are within standard clinical limits.',
      'Electrolyte balance (Sodium 141 mmol/L, Potassium 4.2 mmol/L) is optimal.',
      'Fasting glucose of 106 mg/dL is mildly above standard fasting reference (70–99 mg/dL).',
    ],
    clinicianDiscussionQuestions: [
      'Should we follow up this fasting glucose reading with an HbA1c test?',
      'Are there dietary adjustments or timing considerations for future fasting labs?',
      'When is the recommended interval for a repeat metabolic panel?',
    ],
    terminologyGlossary: [
      {
        term: 'eGFR',
        definition:
          'Estimated Glomerular Filtration Rate — measures how efficiently kidneys filter waste from the bloodstream.',
      },
      {
        term: 'ALT',
        definition:
          'Alanine Aminotransferase — an enzyme primarily found in liver cells, evaluated to monitor liver tissue health.',
      },
      {
        term: 'Fasting Blood Glucose',
        definition:
          'The concentration of glucose in the bloodstream measured after at least 8 to 12 hours without food intake.',
      },
    ],
  },
  {
    id: 'rec-002',
    name: 'Lipid Profile & Cardiovascular Screen',
    category: 'Laboratory Report',
    recordDate: '2024-08-15',
    facility: 'St. Jude Community Hospital Labs',
    clinician: 'Dr. Michael Chen, MD (Cardiology)',
    fileSize: '890 KB',
    fileType: 'PDF',
    processingStatus: 'Processed (Demo)',
    isSynthetic: true,
    summary:
      'Synthetic lipid panel showing favorable high-density lipoprotein (HDL) levels alongside mild elevation in non-HDL and LDL cholesterol.',
    extractedFields: [
      {
        id: 'ef-201',
        testName: 'Total Cholesterol',
        value: 212,
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'Outside Reference Range',
        category: 'Lipid',
        interpretationNotes: 'Borderline elevated total circulating cholesterol.',
      },
      {
        id: 'ef-202',
        testName: 'HDL (High-Density Lipoprotein)',
        value: 62,
        unit: 'mg/dL',
        referenceRange: '> 50 mg/dL',
        status: 'Within Reference Range',
        category: 'Lipid',
        interpretationNotes: 'Protective cholesterol fraction is in a healthy range.',
      },
      {
        id: 'ef-203',
        testName: 'LDL (Low-Density Lipoprotein)',
        value: 128,
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'Outside Reference Range',
        category: 'Lipid',
        interpretationNotes: 'Mild elevation compared to optimal primary target.',
      },
      {
        id: 'ef-204',
        testName: 'Serum Triglycerides',
        value: 135,
        unit: 'mg/dL',
        referenceRange: '< 150 mg/dL',
        status: 'Within Reference Range',
        category: 'Lipid',
      },
    ],
    keyFindings: [
      'Total cholesterol is 212 mg/dL (target < 200 mg/dL) and LDL is 128 mg/dL (target < 100 mg/dL).',
      'HDL cholesterol is 62 mg/dL, which is considered favorable.',
      'Triglycerides are 135 mg/dL, well within the normal < 150 mg/dL window.',
    ],
    clinicianDiscussionQuestions: [
      'Does my overall cardiovascular risk warrant lifestyle modification alone or lipid-lowering therapy?',
      'How do my dietary fiber and saturated fat intake influence these numbers?',
    ],
    terminologyGlossary: [
      {
        term: 'HDL vs LDL',
        definition:
          'HDL transports excess cholesterol away from arteries back to the liver, whereas LDL deposits cholesterol onto arterial walls.',
      },
      {
        term: 'Triglycerides',
        definition:
          'A type of fat circulating in the blood, stored from unused calories and evaluated in metabolic health assessments.',
      },
    ],
  },
  {
    id: 'rec-003',
    name: 'Complete Blood Count (CBC) with Differential',
    category: 'Laboratory Report',
    recordDate: '2024-06-20',
    facility: 'Apex Diagnostics & Clinical Lab',
    clinician: 'Dr. Sarah Jenkins, MD',
    fileSize: '1.1 MB',
    fileType: 'PDF',
    processingStatus: 'Processed (Demo)',
    isSynthetic: true,
    summary:
      'Synthetic hematology profile showing normal red cell count, hemoglobin, leukocyte indices, and platelet numbers.',
    extractedFields: [
      {
        id: 'ef-301',
        testName: 'Hemoglobin',
        value: 14.1,
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5 g/dL',
        status: 'Within Reference Range',
        category: 'Hematology',
      },
      {
        id: 'ef-302',
        testName: 'Hematocrit',
        value: 41.8,
        unit: '%',
        referenceRange: '37.0 - 48.0 %',
        status: 'Within Reference Range',
        category: 'Hematology',
      },
      {
        id: 'ef-303',
        testName: 'White Blood Cell Count (WBC)',
        value: 6.8,
        unit: 'x10³/µL',
        referenceRange: '4.5 - 11.0 x10³/µL',
        status: 'Within Reference Range',
        category: 'Hematology',
      },
      {
        id: 'ef-304',
        testName: 'Platelets',
        value: 245,
        unit: 'x10³/µL',
        referenceRange: '150 - 450 x10³/µL',
        status: 'Within Reference Range',
        category: 'Hematology',
      },
    ],
    keyFindings: [
      'All cell lineages (erythrocytes, leukocytes, thrombocytes) are within expected physiological reference intervals.',
      'No signs of anemia or acute leukocytosis.',
    ],
    clinicianDiscussionQuestions: [
      'Are there any nutritional flags in my red blood cell indices?',
    ],
    terminologyGlossary: [
      {
        term: 'Hematocrit',
        definition:
          'The proportion of total blood volume made up of red blood cells.',
      },
      {
        term: 'Platelets',
        definition:
          'Small cell fragments vital for normal blood clotting and vascular repair.',
      },
    ],
  },
  {
    id: 'rec-004',
    name: 'Outpatient Medication Prescription Slip',
    category: 'Prescription',
    recordDate: '2024-08-16',
    facility: 'Metro Health Cardiology Clinic',
    clinician: 'Dr. Michael Chen, MD',
    fileSize: '420 KB',
    fileType: 'JPG',
    processingStatus: 'Processed (Demo)',
    isSynthetic: true,
    summary:
      'Synthetic prescription document for lipid optimization regimen and maintenance vitamin supplementation.',
    extractedFields: [],
    medications: [
      {
        id: 'med-01',
        name: 'Atorvastatin Calcium',
        dosage: '10 mg',
        frequency: 'Once daily at bedtime',
        startDate: '2024-08-16',
        prescribingClinician: 'Dr. Michael Chen, MD',
        instructions: 'Take oral tablet with water at night. Monitor for unprovoked muscle aches.',
        status: 'Active',
      },
      {
        id: 'med-02',
        name: 'Cholecalciferol (Vitamin D3)',
        dosage: '2000 IU',
        frequency: 'Once daily with breakfast',
        startDate: '2024-08-16',
        prescribingClinician: 'Dr. Sarah Jenkins, MD',
        instructions: 'Take with food containing healthy fats to enhance absorption.',
        status: 'Active',
      },
    ],
    keyFindings: [
      'Documented start of low-dose statin therapy following August 2024 lipid discussion.',
      'Daily 2000 IU Vitamin D3 supplementation continued.',
    ],
    clinicianDiscussionQuestions: [
      'When should liver function tests (LFTs) be checked after starting Atorvastatin?',
    ],
    terminologyGlossary: [
      {
        term: 'Atorvastatin',
        definition:
          'An HMG-CoA reductase inhibitor used to lower LDL cholesterol and reduce cardiovascular risk.',
      },
    ],
  },
  {
    id: 'rec-005',
    name: 'Outpatient Orthopedic Consultation Note',
    category: 'Discharge Summary',
    recordDate: '2024-05-10',
    facility: 'University Sports Medicine & Orthopedics',
    clinician: 'Dr. David Ramirez, DO',
    fileSize: '650 KB',
    fileType: 'PDF',
    processingStatus: 'Processed (Demo)',
    isSynthetic: true,
    summary:
      'Synthetic clinical note detailing evaluation for right patellofemoral strain incurred during marathon training. Physical therapy protocol initiated.',
    extractedFields: [],
    keyFindings: [
      'No ligamentous laxity or acute meniscus tear detected on physical exam.',
      'Prescribed 6-week progressive quadriceps and hip abductor strengthening regimen.',
    ],
    clinicianDiscussionQuestions: [
      'When is it safe to resume running volume over 15 kilometers per week?',
    ],
    terminologyGlossary: [
      {
        term: 'Patellofemoral Strain',
        definition:
          'Irritation or discomfort where the kneecap articulates with the femur bone, common with repeated impact.',
      },
    ],
  },
  {
    id: 'rec-006',
    name: 'Digital Chest X-Ray (PA & Lateral)',
    category: 'Diagnostic Report',
    recordDate: '2024-03-02',
    facility: 'St. Jude Diagnostic Imaging Center',
    clinician: 'Dr. Elena Rostova, MD (Radiology)',
    fileSize: '3.2 MB',
    fileType: 'PDF',
    processingStatus: 'Processed (Demo)',
    isSynthetic: true,
    summary:
      'Synthetic radiology report confirming clear pulmonary parenchyma, normal cardiothoracic ratio, and no focal consolidation.',
    extractedFields: [],
    keyFindings: [
      'Lungs are clear with no infiltrates, effusion, or pneumothorax.',
      'Normal cardiac silhouette size and thoracic bony architecture.',
    ],
    clinicianDiscussionQuestions: [
      'Does this baseline study require any routine radiographic follow-up?',
    ],
    terminologyGlossary: [
      {
        term: 'Cardiothoracic Ratio',
        definition:
          'The ratio of the transverse diameter of the heart to the internal diameter of the rib cage, evaluated for cardiomegaly.',
      },
    ],
  },
]

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-001',
    title: 'Comprehensive Metabolic Panel (CMP) Completed',
    eventType: 'Laboratory Report',
    date: '2024-09-28',
    source: 'Apex Diagnostics & Clinical Lab',
    description:
      'Synthetic laboratory panel uploaded. Fasting glucose noted at 106 mg/dL; renal and electrolyte parameters in normal range.',
    relatedRecordId: 'rec-001',
    tags: ['Blood Test', 'Metabolic', 'Fasting Glucose'],
    severity: 'caution',
  },
  {
    id: 'evt-002',
    title: 'Lipid Lowering Prescription Dispensed',
    eventType: 'Prescription',
    date: '2024-08-16',
    source: 'Metro Health Cardiology Clinic',
    description:
      'Synthetic prescription issued: Atorvastatin 10mg daily and Cholecalciferol 2000 IU daily.',
    relatedRecordId: 'rec-004',
    tags: ['Medication', 'Statin', 'Cardiology'],
    severity: 'normal',
  },
  {
    id: 'evt-003',
    title: 'Cardiovascular Risk & Lipid Screen',
    eventType: 'Laboratory Report',
    date: '2024-08-15',
    source: 'St. Jude Community Hospital Labs',
    description:
      'Synthetic panel documented Total Cholesterol at 212 mg/dL, LDL at 128 mg/dL, and protective HDL at 62 mg/dL.',
    relatedRecordId: 'rec-002',
    tags: ['Lipid Panel', 'Cardio', 'Cholesterol'],
    severity: 'caution',
  },
  {
    id: 'evt-004',
    title: 'Simulated 10K Endurance Run & Wellness Sync',
    eventType: 'Wellness Entry',
    date: '2024-07-04',
    source: 'Simulated Wearable Telemetry',
    description:
      'Simulated device recorded 12,420 steps, peak active heart rate 158 bpm, resting recovery rate 64 bpm.',
    tags: ['Wearable Simulation', 'Activity', 'Heart Rate'],
    severity: 'neutral',
  },
  {
    id: 'evt-005',
    title: 'Annual Complete Blood Count (CBC)',
    eventType: 'Laboratory Report',
    date: '2024-06-20',
    source: 'Apex Diagnostics & Clinical Lab',
    description:
      'Synthetic baseline CBC confirmed normal hemoglobin (14.1 g/dL), leukocyte, and platelet counts.',
    relatedRecordId: 'rec-003',
    tags: ['Hematology', 'Annual Checkup'],
    severity: 'normal',
  },
  {
    id: 'evt-006',
    title: 'Sports Medicine Evaluation for Knee Strain',
    eventType: 'Hospital Visit',
    date: '2024-05-10',
    source: 'University Sports Medicine Clinic',
    description:
      'Synthetic clinical consultation for patellofemoral discomfort. Physical therapy exercises initiated.',
    relatedRecordId: 'rec-005',
    tags: ['Orthopedics', 'Outpatient', 'Physical Therapy'],
    severity: 'normal',
  },
  {
    id: 'evt-007',
    title: 'Routine Screening Chest Radiograph',
    eventType: 'Diagnostic Report',
    date: '2024-03-02',
    source: 'St. Jude Diagnostic Imaging Center',
    description:
      'Synthetic radiographic study reported clear lung fields and normal cardiac contours.',
    relatedRecordId: 'rec-006',
    tags: ['Imaging', 'X-Ray', 'Radiology'],
    severity: 'normal',
  },
]
