import type { ChatMessage } from '../types/health'

export const COPILOT_EXAMPLE_PROMPTS = [
  'Summarize my latest sample report.',
  'Explain the meaning of this laboratory test.',
  'Show the records available in my timeline.',
  'What information is missing from my health profile?',
  'Explain my sample wellness trends.',
]

export const INITIAL_COPILOT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    sender: 'assistant',
    timestamp: 'Just now',
    content:
      'Hello Alex! I am your **HealthTwin Copilot**. I can help you understand your organized synthetic records, summarize laboratory results in plain language, and highlight points to discuss with your healthcare provider.\n\n*Note: In this frontend demo mode, all answers are simulated and grounded in demo files.* How can I assist you today?',
    isSimulated: true,
    suggestedFollowUps: [
      'Summarize my latest sample report.',
      'Explain my sample wellness trends.',
    ],
  },
]

export const PREDEFINED_COPILOT_RESPONSES: Record<
  string,
  { content: string; citations: string[]; suggestedFollowUps: string[] }
> = {
  'summarize my latest sample report.': {
    content: `Here is a plain-language summary of your latest documented record: **Comprehensive Metabolic Panel (CMP)** dated **September 28, 2024** (Apex Diagnostics & Clinical Lab).

### Key Takeaways:
1. **Kidney Filtration:** Your estimated filtration rate (**eGFR: 98 mL/min/1.73m²**) and **Creatinine (0.9 mg/dL)** are within standard reference ranges, showing healthy renal clearance.
2. **Electrolytes & Liver Enzymes:** Sodium (141 mmol/L), Potassium (4.2 mmol/L), and liver enzyme ALT (28 U/L) are all in healthy reference ranges.
3. **Fasting Glucose:** Measured at **106 mg/dL**, which is slightly above the standard fasting laboratory cutoff (70–99 mg/dL). 

### Suggested Conversation Starters with Your Clinician:
* *"Would an HbA1c test be helpful to evaluate my 3-month average glucose trend?"*
* *"Are there dietary tweaks or timing recommendations before my next fasting blood draw?"*

*(Simulated summary grounded in demo record REC-001. Not a clinical diagnosis.)*`,
    citations: ['Record REC-001: Comprehensive Metabolic Panel (CMP) — Sep 28, 2024'],
    suggestedFollowUps: [
      'Explain the meaning of this laboratory test.',
      'What information is missing from my health profile?',
    ],
  },

  'explain the meaning of this laboratory test.': {
    content: `Let's break down key tests from your latest metabolic and lipid panels:

* **eGFR (Estimated Glomerular Filtration Rate):** Measured at **98 mL/min/1.73m²**. This calculates how efficiently tiny filters in your kidneys remove waste from your blood. A value above 60 is generally considered reassuring for kidney function.
* **Fasting Blood Glucose:** Measured at **106 mg/dL**. This measures the circulating sugar in your bloodstream after an 8–12 hour fast. A level between 100–125 mg/dL is classified in lab reference ranges as borderline/impaired fasting glucose.
* **HDL vs. LDL Cholesterol:** In your August 2024 lipid screen, **HDL ("protective") was 62 mg/dL** (favorable), while **LDL ("low-density") was 128 mg/dL** (borderline elevated above the <100 mg/dL target).

*(Educational overview based on standard synthetic laboratory reference data.)*`,
    citations: ['REC-001: Metabolic Panel', 'REC-002: Lipid Profile & Cardiovascular Screen'],
    suggestedFollowUps: [
      'Summarize my latest sample report.',
      'Show the records available in my timeline.',
    ],
  },

  'show the records available in my timeline.': {
    content: `Your Health Digital Twin currently has **6 synthetic records** indexed across 2024:

1. **Sep 28, 2024:** *Comprehensive Metabolic Panel (CMP)* — Apex Diagnostics (Lab Report)
2. **Aug 16, 2024:** *Outpatient Prescription Slip* — Metro Health Cardiology (Atorvastatin 10mg, Vitamin D3)
3. **Aug 15, 2024:** *Lipid Profile & Cardiovascular Screen* — St. Jude Community Labs (Lab Report)
4. **Jul 04, 2024:** *Endurance Run & Telemetry Sync* — Simulated Wearable Telemetry (Wellness Entry)
5. **Jun 20, 2024:** *Complete Blood Count (CBC)* — Apex Diagnostics (Lab Report)
6. **May 10, 2024:** *Outpatient Orthopedic Consultation* — University Sports Medicine (Discharge Summary)
7. **Mar 02, 2024:** *Digital Chest X-Ray* — St. Jude Imaging Center (Diagnostic Report)

You can explore these interactively in the **Health Timeline** tab.`,
    citations: ['Timeline Index: 7 historical events mapped'],
    suggestedFollowUps: [
      'What information is missing from my health profile?',
      'Explain my sample wellness trends.',
    ],
  },

  'what information is missing from my health profile?': {
    content: `To build a more comprehensive Health Digital Twin, here are high-value health data points that are currently unrecorded in your demo profile:

1. **HbA1c Laboratory Test:** Because your recent fasting glucose was 106 mg/dL, an HbA1c test would provide a 3-month glycemic window.
2. **Immunization / Vaccination Records:** No recent tetanus booster, flu shot, or COVID-19 vaccination history is documented.
3. **Family Medical History:** Documented parental or sibling cardiovascular, endocrine, or oncological histories are absent.
4. **Vital Signs Continuity:** In-clinic blood pressure logs and pulse oximetry checks outside of simulated wearable telemetry.

*(This gap analysis is purely informational to help you identify documents you may want to collect from your patient portal.)*`,
    citations: ['Data Completeness Index: 68% structured coverage'],
    suggestedFollowUps: [
      'Summarize my latest sample report.',
      'Show the records available in my timeline.',
    ],
  },

  'explain my sample wellness trends.': {
    content: `Here is an overview of your **Simulated Wearable Telemetry** over the past 30 days:

* **Resting Heart Rate:** Very stable at **60 bpm** (within the optimal 60–72 bpm athletic resting range), dropping predictably during deep sleep phases.
* **Daily Activity:** Averaging **9,080 steps per day**, consistently achieving your 8,000-step daily baseline with weekend outdoor peaks over 11,000 steps.
* **Sleep Architecture:** Averaging **7.3 hours per night** with **89% sleep efficiency**. You have an even distribution between deep slow-wave sleep (1.7 hours) and REM (1.8 hours).
* **Weekly Exercise:** Logging **48 active minutes daily**, well above the 150 minutes/week moderate activity recommendation.

*(Simulated telemetry data for interface demonstration. Not connected to a real smart device or sensor.)*`,
    citations: ['Simulated Wearable Telemetry Stream: 30-day aggregate'],
    suggestedFollowUps: [
      'Summarize my latest sample report.',
      'Explain the meaning of this laboratory test.',
    ],
  },
}

export const FALLBACK_COPILOT_RESPONSE = (userPrompt: string): string => {
  return `Thank you for asking: *"${userPrompt}"*.

### Frontend Demonstration Notice:
HealthTwin AI is currently operating in **Frontend Prototype Mode** with static synthetic demo records.

To answer open-ended or arbitrary medical questions:
1. The **Backend API (FastAPI / Python)** will ingest and parse user medical records with OCR and LLM token extraction.
2. The **RAG (Retrieval-Augmented Generation)** pipeline will retrieve exact citation chunks from your verified documents.
3. The Copilot will generate grounded, clinician-friendly explanations with verified laboratory references.

In the meantime, feel free to click any of the **Example Question Chips** above to experience the planned response format and design!`
}
